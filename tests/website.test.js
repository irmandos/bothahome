import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const SRC_DIR = path.resolve(__dirname, '../src');

function loadHTML(fileName) {
  const filePath = path.join(SRC_DIR, fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(content);
  return { dom, content };
}

describe('index.html structure and integrity', () => {
  const { dom } = loadHTML('index.html');
  const document = dom.window.document;

  it('should have standard meta tags', () => {
    const charset = document.querySelector('meta[charset]');
    expect(charset).toBeDefined();
    expect(charset.getAttribute('charset').toLowerCase()).toBe('utf-8');

    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).toBeDefined();
    expect(viewport.getAttribute('content')).toContain('width=device-width');
  });

  it('should have a title', () => {
    const title = document.querySelector('title');
    expect(title).toBeDefined();
    expect(title.textContent).toContain('BothaHome');
  });

  it('should verify all image tags reference existing files', () => {
    const images = Array.from(document.querySelectorAll('img'));
    images.forEach(img => {
      const src = img.getAttribute('src');
      // If src is relative to index.html (e.g. starts with assets/ or logo/)
      if (src && !src.startsWith('http') && !src.startsWith('//')) {
        const filePath = path.join(SRC_DIR, src);
        const exists = fs.existsSync(filePath);
        expect(exists).toBe(true);
      }
    });
  });

  it('should verify picture sources reference existing files', () => {
    const sources = Array.from(document.querySelectorAll('picture source'));
    sources.forEach(source => {
      const srcset = source.getAttribute('srcset');
      if (srcset && !srcset.startsWith('http') && !srcset.startsWith('//')) {
        const filePath = path.join(SRC_DIR, srcset);
        const exists = fs.existsSync(filePath);
        expect(exists).toBe(true);
      }
    });
  });

  it('should verify link tags (e.g. stylesheet, icon) reference existing files', () => {
    const links = Array.from(document.querySelectorAll('link'));
    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Only verify local files
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        const filePath = path.join(SRC_DIR, href);
        const exists = fs.existsSync(filePath);
        expect(exists).toBe(true);
      }
    });
  });

  it('should have valid links', () => {
    const anchors = Array.from(document.querySelectorAll('a'));
    anchors.forEach(a => {
      const href = a.getAttribute('href');
      expect(href).toBeDefined();
      expect(href.length).toBeGreaterThan(0);
    });
  });

  it('should contain privacy policy and terms links in the footer', () => {
    const footer = document.querySelector('footer');
    expect(footer).toBeDefined();
    const privacyLink = footer.querySelector('a[href="privacy-policy.html"]');
    const termsLink = footer.querySelector('a[href="terms-of-service.html"]');
    expect(privacyLink).toBeDefined();
    expect(termsLink).toBeDefined();
  });

  it('should preload the welcome background image', () => {
    const preload = document.querySelector('link[rel="preload"][as="image"]');
    expect(preload).toBeDefined();
    expect(preload.getAttribute('href')).toBe('assets/images/botha_welcome1.webp');
    expect(preload.getAttribute('type')).toBe('image/webp');
  });

  it('should have aria-pressed initialized on theme-toggle', () => {
    const toggle = document.getElementById('theme-toggle');
    expect(toggle).toBeDefined();
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
  });

  it('should have keyboard accessibility rules in home.css', () => {
    const cssPath = path.join(SRC_DIR, 'assets/css/home.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    expect(cssContent).toContain(':focus-within');
    expect(cssContent).toContain(':focus-visible');
  });
});

describe('policy pages structure', () => {
  const pages = ['privacy-policy.html', 'terms-of-service.html'];

  pages.forEach(page => {
    it(`should have valid structure and theme elements for ${page}`, () => {
      const { dom } = loadHTML(page);
      const doc = dom.window.document;

      const charset = doc.querySelector('meta[charset]');
      expect(charset).toBeDefined();
      expect(charset.getAttribute('charset').toLowerCase()).toBe('utf-8');

      const viewport = doc.querySelector('meta[name="viewport"]');
      expect(viewport).toBeDefined();

      const title = doc.querySelector('title');
      expect(title).toBeDefined();
      expect(title.textContent.length).toBeGreaterThan(0);

      // Check footer links presence
      const footer = doc.querySelector('footer');
      expect(footer).toBeDefined();
      const privacyLink = footer.querySelector('a[href="privacy-policy.html"]');
      const termsLink = footer.querySelector('a[href="terms-of-service.html"]');
      expect(privacyLink).toBeDefined();
      expect(termsLink).toBeDefined();

      // Check theme toggle and back button
      const toggle = doc.getElementById('theme-toggle');
      expect(toggle).toBeDefined();
      const backBtn = doc.querySelector('.back-btn[href="index.html"]');
      expect(backBtn).toBeDefined();
    });
  });
});
