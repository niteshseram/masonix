import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';

import { Masonry } from '../../components/masonry';
import type { MasonryRenderProps } from '../../types';

// Minimal render component for tests
function Card({ data, width }: MasonryRenderProps<string>) {
  return (
    <div data-testid="card" data-width={width}>
      {data}
    </div>
  );
}

function attr(el: Element | null, name: string) {
  return el?.getAttribute(name) ?? null;
}

describe('Masonry', () => {
  describe('item rendering', () => {
    it('renders all items', () => {
      render(
        <Masonry
          items={['a', 'b', 'c', 'd']}
          render={Card}
          defaultWidth={900}
          columns={3}
        />,
      );
      expect(screen.getAllByTestId('card')).toHaveLength(4);
    });

    it('distributes items round-robin: item i → column i % columnCount', () => {
      const { container } = render(
        <Masonry
          items={['a', 'b', 'c', 'd', 'e']}
          render={Card}
          defaultWidth={900}
          columns={3}
        />,
      );
      const cols = container.firstElementChild!.children;
      expect(cols).toHaveLength(3);
      // col0: indices 0,3 → 'a','d'
      // col1: indices 1,4 → 'b','e'
      // col2: index  2   → 'c'
      expect(cols[0].querySelectorAll('[data-testid="card"]')).toHaveLength(2);
      expect(cols[1].querySelectorAll('[data-testid="card"]')).toHaveLength(2);
      expect(cols[2].querySelectorAll('[data-testid="card"]')).toHaveLength(1);
    });

    it('passes correct index to render', () => {
      function IndexCard({ index }: MasonryRenderProps<string>) {
        return <div data-testid="card" data-index={index} />;
      }
      render(
        <Masonry
          items={['a', 'b', 'c']}
          render={IndexCard}
          defaultWidth={900}
          columns={3}
        />,
      );
      const cards = screen.getAllByTestId('card');
      expect(attr(cards[0], 'data-index')).toBe('0');
      expect(attr(cards[1], 'data-index')).toBe('1');
      expect(attr(cards[2], 'data-index')).toBe('2');
    });

    it('passes columnWidth as width to render', () => {
      // 900px container, 3 columns, gap=0 → columnWidth = floor(900/3) = 300
      render(
        <Masonry
          items={['a', 'b', 'c']}
          render={Card}
          defaultWidth={900}
          columns={3}
        />,
      );
      expect(attr(screen.getAllByTestId('card')[0], 'data-width')).toBe('300');
    });
  });

  describe('effectiveColumnCount', () => {
    it('renders fewer columns when itemCount < columns', () => {
      const { container } = render(
        <Masonry
          items={['a', 'b']}
          render={Card}
          defaultWidth={900}
          columns={5}
        />,
      );
      expect(container.firstElementChild!.children).toHaveLength(2);
    });
  });

  describe('accessibility', () => {
    it('has role="list" by default', () => {
      const { container } = render(
        <Masonry items={['a']} render={Card} defaultWidth={900} />,
      );
      expect(attr(container.firstElementChild, 'role')).toBe('list');
    });

    it('applies role="grid"', () => {
      const { container } = render(
        <Masonry items={['a']} render={Card} defaultWidth={900} role="grid" />,
      );
      expect(attr(container.firstElementChild, 'role')).toBe('grid');
    });

    it('omits role attribute when role="none"', () => {
      const { container } = render(
        <Masonry items={['a']} render={Card} defaultWidth={900} role="none" />,
      );
      expect(container.firstElementChild?.hasAttribute('role')).toBe(false);
    });

    it('sets aria-label', () => {
      const { container } = render(
        <Masonry
          items={['a']}
          render={Card}
          defaultWidth={900}
          aria-label="Photo gallery"
        />,
      );
      expect(attr(container.firstElementChild, 'aria-label')).toBe(
        'Photo gallery',
      );
    });

    it('assigns role=listitem, aria-setsize, and aria-posinset to each item wrapper', () => {
      const { container } = render(
        <Masonry
          items={['a', 'b', 'c']}
          render={Card}
          defaultWidth={900}
          columns={3}
        />,
      );
      const listItems = container.querySelectorAll('[role="listitem"]');
      expect(listItems).toHaveLength(3);
      expect(attr(listItems[0], 'aria-setsize')).toBe('3');
      expect(attr(listItems[0], 'aria-posinset')).toBe('1');
      expect(attr(listItems[2], 'aria-posinset')).toBe('3');
    });

    it('omits listitem role and aria attrs when role=none', () => {
      const { container } = render(
        <Masonry
          items={['a', 'b']}
          render={Card}
          defaultWidth={900}
          role="none"
        />,
      );
      expect(container.querySelectorAll('[role="listitem"]')).toHaveLength(0);
    });

    it('assigns role=presentation to column wrappers', () => {
      const { container } = render(
        <Masonry
          items={['a', 'b', 'c']}
          render={Card}
          defaultWidth={900}
          columns={3}
        />,
      );
      const masonry = container.firstElementChild!;
      const colWrappers = Array.from(masonry.children);
      for (const col of colWrappers) {
        expect(attr(col, 'role')).toBe('presentation');
      }
    });

    it('includes an aria-live polite region for announcements', () => {
      const { container } = render(
        <Masonry items={['a', 'b']} render={Card} defaultWidth={900} />,
      );
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(attr(liveRegion, 'aria-atomic')).toBe('true');
    });
  });

  describe('gap inline style', () => {
    it('applies columnGap to container when gap > 0', () => {
      const { container } = render(
        <Masonry
          items={['a', 'b', 'c']}
          render={Card}
          defaultWidth={900}
          columns={3}
          gap={16}
        />,
      );
      expect((container.firstElementChild as HTMLElement).style.columnGap).toBe(
        '16px',
      );
    });

    it('does not set columnGap when gap is 0', () => {
      const { container } = render(
        <Masonry items={['a']} render={Card} defaultWidth={900} gap={0} />,
      );
      expect((container.firstElementChild as HTMLElement).style.columnGap).toBe(
        '',
      );
    });

    it('applies rowGap to column wrappers when gap > 0', () => {
      const { container } = render(
        <Masonry
          items={['a', 'b']}
          render={Card}
          defaultWidth={900}
          columns={2}
          gap={12}
        />,
      );
      const col = container.firstElementChild!.firstElementChild as HTMLElement;
      expect(col.style.rowGap).toBe('12px');
    });
  });

  describe('polymorphic as prop', () => {
    it('renders as <ul> when as="ul"', () => {
      const { container } = render(
        <Masonry items={['a']} render={Card} defaultWidth={900} as="ul" />,
      );
      expect(container.firstElementChild!.tagName).toBe('UL');
    });
  });

  describe('itemAs prop', () => {
    it('wraps each item in the specified element', () => {
      const { container } = render(
        <Masonry
          items={['a', 'b']}
          render={Card}
          defaultWidth={900}
          columns={2}
          itemAs="article"
        />,
      );
      expect(container.querySelectorAll('article')).toHaveLength(2);
    });
  });

  describe('className props', () => {
    it('applies className to the container', () => {
      const { container } = render(
        <Masonry
          items={['a']}
          render={Card}
          defaultWidth={900}
          className="my-grid"
        />,
      );
      expect(container.firstElementChild?.classList.contains('my-grid')).toBe(
        true,
      );
    });

    it('applies columnClassName to column wrappers', () => {
      const { container } = render(
        <Masonry
          items={['a', 'b']}
          render={Card}
          defaultWidth={900}
          columns={2}
          columnClassName="col"
        />,
      );
      const cols = container.firstElementChild!.children;
      expect(cols[0].classList.contains('col')).toBe(true);
      expect(cols[1].classList.contains('col')).toBe(true);
    });

    it('applies itemClassName to item wrappers', () => {
      const { container } = render(
        <Masonry
          items={['a', 'b']}
          render={Card}
          defaultWidth={900}
          columns={2}
          itemClassName="item"
        />,
      );
      expect(container.querySelectorAll('.item')).toHaveLength(2);
    });
  });

  describe('style prop', () => {
    it('merges user style with layout styles', () => {
      const { container } = render(
        <Masonry
          items={['a']}
          render={Card}
          defaultWidth={900}
          style={{ background: 'red' }}
        />,
      );
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.background).toBe('red');
      expect(el.style.display).toBe('flex');
    });
  });

  describe('itemKey prop', () => {
    it('renders without error when itemKey is provided', () => {
      type Item = { id: string; label: string };
      const items: Item[] = [
        { id: 'x', label: 'X' },
        { id: 'y', label: 'Y' },
      ];
      function ItemCard({ data }: MasonryRenderProps<Item>) {
        return <span>{data.label}</span>;
      }
      expect(() =>
        render(
          <Masonry
            items={items}
            render={ItemCard}
            defaultWidth={900}
            itemKey={(data) => data.id}
          />,
        ),
      ).not.toThrow();
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to the container DOM element', () => {
      const ref = { current: null as HTMLElement | null };
      render(
        <Masonry items={['a']} render={Card} defaultWidth={900} ref={ref} />,
      );
      expect(ref.current).not.toBeNull();
      expect(ref.current!.tagName).toBe('DIV');
    });

    it('forwards ref to a custom container element', () => {
      const ref = { current: null as HTMLElement | null };
      render(
        <Masonry
          items={['a']}
          render={Card}
          defaultWidth={900}
          as="ul"
          ref={ref}
        />,
      );
      expect(ref.current!.tagName).toBe('UL');
    });
  });
});
