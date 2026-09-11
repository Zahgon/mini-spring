/**
 * The `org.dom4j` surface `XmlBeanDefinitionReader` uses, over a standards
 * compliant DOM parser.
 *
 * The one dom4j behaviour that matters and is *not* the DOM default is name
 * matching: `Element.getName()` returns the **local** name, so
 * `root.element("component-scan")` finds `<context:component-scan/>` regardless
 * of its prefix. `Element.attributeValue(name)` returns `null`, not `""`, for
 * an absent attribute — the reader distinguishes the two.
 */

import { DOMParser } from '@xmldom/xmldom';
import type { Document as XmlDocument, Element as XmlElement } from '@xmldom/xmldom';
import type { InputStream } from '../java/io/InputStream.js';
import { JavaThrowable } from '../java/lang/Exceptions.js';

export class DocumentException extends JavaThrowable {}

export class Element {
  constructor(private readonly node: XmlElement) {}

  getName(): string {
    return this.node.localName ?? this.node.nodeName;
  }

  /** The first child element with this local name, or `null`. */
  element(name: string): Element | null {
    return this.elements(name)[0] ?? null;
  }

  /** All child elements with this local name, in document order. */
  elements(name: string): Element[] {
    const found: Element[] = [];
    for (let child = this.node.firstChild; child !== null; child = child.nextSibling) {
      if (child.nodeType !== 1) {
        continue;
      }
      const element = child as unknown as XmlElement;
      if ((element.localName ?? element.nodeName) === name) {
        found.push(new Element(element));
      }
    }
    return found;
  }

  attributeValue(name: string): string | null {
    return this.node.hasAttribute(name) ? this.node.getAttribute(name) : null;
  }
}

export class Document {
  constructor(private readonly document: XmlDocument) {}

  getRootElement(): Element {
    const root = this.document.documentElement;
    if (root === null) {
      throw new DocumentException('Document has no root element');
    }
    return new Element(root as unknown as XmlElement);
  }
}

export class SAXReader {
  read(inputStream: InputStream): Document {
    const text = inputStream.readAllBytes().toString('utf8');
    let parsed: XmlDocument;
    try {
      parsed = new DOMParser({
        onError: (level, message) => {
          if (level === 'error' || level === 'fatalError') {
            throw new DocumentException(message);
          }
        },
      }).parseFromString(text, 'text/xml') as unknown as XmlDocument;
    } catch (error) {
      throw new DocumentException(error instanceof Error ? error.message : String(error), error);
    }
    return new Document(parsed);
  }
}
