import { triggerDownload } from '@/utils/download';

describe('triggerDownload', () => {
  // Mock DOM APIs
  const originalCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  const originalRemoveChild = document.body.removeChild;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  let createdLinks: HTMLAnchorElement[] = [];
  let appendedElements: Node[] = [];
  let removedElements: Node[] = [];
  let objectUrlsCreated: (string | Blob)[] = [];
  let objectUrlsRevoked: string[] = [];

  beforeEach(() => {
    // Reset arrays
    createdLinks = [];
    appendedElements = [];
    removedElements = [];
    objectUrlsCreated = [];
    objectUrlsRevoked = [];

    // Mock createElement to track anchor links
    document.createElement = jest.fn((tagName: string) => {
      if (tagName === 'a') {
        const link = {
          href: '',
          download: '',
          style: { display: '' },
          click: jest.fn(),
        } as unknown as HTMLAnchorElement;
        createdLinks.push(link);
        return link;
      }
      return originalCreateElement.call(document, tagName);
    });

    // Mock appendChild to track appended elements
    document.body.appendChild = jest.fn(<T extends Node>(node: T): T => {
      appendedElements.push(node);
      return node;
    });

    // Mock removeChild to track removed elements
    document.body.removeChild = jest.fn(<T extends Node>(child: T): T => {
      removedElements.push(child);
      return child;
    });

    // Mock URL.createObjectURL
    URL.createObjectURL = jest.fn((blob: Blob) => {
      const url = `mock-url-${Date.now()}`;
      objectUrlsCreated.push(blob);
      return url;
    });

    // Mock URL.revokeObjectURL
    URL.revokeObjectURL = jest.fn((url: string) => {
      objectUrlsRevoked.push(url);
    });
  });

  afterEach(() => {
    // Restore original implementations
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;

    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('with Blob data', () => {
    it('should create an anchor element and trigger download with blob data', () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      const fileName = 'test.txt';

      // Use fake timers before calling the function
      jest.useFakeTimers();
      triggerDownload(mockBlob, fileName);

      // Initially, link should be created and added to body
      expect(createdLinks.length).toBe(1);
      const link = createdLinks[0];
      expect(link.download).toBe(fileName);
      expect(appendedElements.length).toBe(1);

      // Advance timers to trigger the click
      jest.advanceTimersByTime(0);
      expect(link.click).toHaveBeenCalledTimes(1);

      // Advance timers again to trigger cleanup
      jest.advanceTimersByTime(150);
      expect(removedElements.length).toBe(1);
      expect(objectUrlsRevoked.length).toBe(1);
    });

    it('should use URL.createObjectURL for blob data', () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });

      // Use fake timers before calling the function
      jest.useFakeTimers();
      triggerDownload(mockBlob, 'test.txt');

      // Check that URL.createObjectURL was called with the blob
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      
      // Advance timers to complete cleanup
      jest.advanceTimersByTime(150);
    });

    it('should revoke object URL after delay', () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });

      // Use fake timers before calling the function
      jest.useFakeTimers();
      triggerDownload(mockBlob, 'test.txt');
      
      // Initially, revoke should not be called
      expect(objectUrlsRevoked.length).toBe(0);

      // Advance timer to trigger cleanup
      jest.advanceTimersByTime(150);
      expect(objectUrlsRevoked.length).toBe(1);
    });
  });

  describe('with string URL data', () => {
    it('should use the string URL directly without creating object URL', () => {
      const urlString = 'https://example.com/file.pdf';
      const fileName = 'file.pdf';

      // Use fake timers before calling the function
      jest.useFakeTimers();
      triggerDownload(urlString, fileName);

      const link = createdLinks[0];
      expect(link.href).toBe(urlString);
      expect(link.download).toBe(fileName);
      expect(appendedElements.length).toBe(1);

      // URL.createObjectURL should not be called for string URLs
      expect(URL.createObjectURL).not.toHaveBeenCalled();

      // Advance timers to trigger click and cleanup
      jest.advanceTimersByTime(0);
      expect(link.click).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(150);
      expect(removedElements.length).toBe(1);
      // URL.revokeObjectURL should not be called for string URLs
      expect(objectUrlsRevoked.length).toBe(0);
    });
  });

  describe('default filename', () => {
    it('should use default filename when not provided', () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });

      // Use fake timers before calling the function
      jest.useFakeTimers();
      triggerDownload(mockBlob);

      const link = createdLinks[0];
      expect(link.download).toBe('file');
    });
  });
});