/* eslint-disable react/display-name */
import React from 'react'
import { cleanup, render, waitForDomChange } from '@vtex/test-tools/react'

import 'jest-dom/extend-expect'
import { TreePathContextProvider } from './utils/treePath'
import { RenderContextProvider } from './components/RenderContext'
import VirtualComponent from './VirtualComponent'

function renderVirtualComponent({
  treePath,
  extensions,
  virtualTrees,
  fetchComponent,
  treeId,
  props,
}: any) {
  return render(
    <RenderContextProvider
      runtime={{ extensions, fetchComponent, virtualTrees } as any}
    >
      <TreePathContextProvider treePath={treePath}>
        <VirtualComponent virtualTreeId={treeId} props={props} />
      </TreePathContextProvider>
    </RenderContextProvider>
  )
}

beforeEach(() => {
  window.__RENDER_8_COMPONENTS__ = {}
})

afterEach(() => {
  cleanup()
})

test(`renders a shallow virtual block with only real blocks`, () => {
  window.__RENDER_8_COMPONENTS__ = {
    div: (({ children, blockClass }: any) => (
      <div className={blockClass}>{children}</div>
    )) as any,
    rich: (({ text }: any) => <span>{text}</span>) as any,
  }

  const virtualTrees = {
    someTreeId: {
      $component: 'div',
      props: {
        blockClass: 'shelf',
      },
    },
  }

  const { container } = renderVirtualComponent({
    extensions: { 'store.home/VirtualComponent': {} },
    virtualTrees,
    treePath: 'store.home/VirtualComponent',
    treeId: 'someTreeId',
  })

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="shelf"
      />
    </div>
  `)
})

test(`renders a deep virtual block with only real blocks`, () => {
  window.__RENDER_8_COMPONENTS__ = {
    div: (({ children, blockClass }: any) => (
      <div className={blockClass}>{children}</div>
    )) as any,
    rich: (({ text }: any) => <span>{text}</span>) as any,
    slider: (({ children }: any) => <ul data-slider>{children}</ul>) as any,
    list: (({ categoryId, children }: any) => (
      <ul data-category={categoryId}>{children}</ul>
    )) as any,
  }

  const virtualTrees = {
    someTreeId: {
      $component: 'div',
      props: {
        blockClass: 'shelf',
      },
      children: [
        {
          $component: 'rich',
          props: {
            text: 'some title',
          },
        },
        {
          $component: 'slider',
          children: [
            {
              $component: 'list',
              props: {
                categoryId: 'some-category',
              },
            },
          ],
        },
      ],
    },
  }

  const { container } = renderVirtualComponent({
    extensions: { 'store.home/VirtualComponent': {} },
    virtualTrees,
    treePath: 'store.home/VirtualComponent',
    treeId: 'someTreeId',
  })

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="shelf"
      >
        <span>
          some title
        </span>
        <ul
          data-slider="true"
        >
          <ul
            data-category="some-category"
          />
        </ul>
      </div>
    </div>
  `)
})

test(`renders async children`, async () => {
  window.__RENDER_8_COMPONENTS__ = {
    div: (({ children, blockClass }: any) => (
      <div className={blockClass}>{children}</div>
    )) as any,
    rich: (({ text }: any) => <span>{text}</span>) as any,
  }

  const asyncComponents: any = {
    slider: (({ children }: any) => <ul data-slider>{children}</ul>) as any,
    list: (({ categoryId, children }: any) => (
      <ul data-category={categoryId}>{children}</ul>
    )) as any,
  }

  const virtualTrees = {
    someTreeId: {
      $component: 'div',
      props: {
        blockClass: 'shelf',
      },
      children: [
        {
          $component: 'rich',
          props: {
            text: 'some title',
          },
        },
        {
          $component: 'slider',
          children: [
            {
              $component: 'list',
              props: {
                categoryId: 'some-category',
              },
            },
          ],
        },
      ],
    },
  }

  const { container } = renderVirtualComponent({
    extensions: { 'store.home/VirtualComponent': {} },
    virtualTrees,
    treePath: 'store.home/VirtualComponent',
    fetchComponent: async (name: string) => {
      window.__RENDER_8_COMPONENTS__[name] = asyncComponents[name]
    },
    treeId: 'someTreeId',
  })

  await waitForDomChange()

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="shelf"
      >
        <span>
          some title
        </span>
        <ul
          data-slider="true"
        >
          <ul
            data-category="some-category"
          />
        </ul>
      </div>
    </div>
  `)
})

test(`renders a virtual component inside a virtual component`, async () => {
  window.__RENDER_8_COMPONENTS__ = {
    VirtualComponent: VirtualComponent as any,
    div: (({ children, blockClass }: any) => (
      <div className={blockClass}>{children}</div>
    )) as any,
    rich: (({ text }: any) => <span>{text}</span>) as any,
    slider: (({ children }: any) => <ul data-slider>{children}</ul>) as any,
    list: (({ categoryId, children }: any) => (
      <ul data-category={categoryId}>{children}</ul>
    )) as any,
  }

  const virtualTrees = {
    someTreeId: {
      $component: 'div',
      props: {
        blockClass: 'shelf',
      },
      children: [
        {
          $component: 'rich',
          props: {
            text: 'some title',
          },
        },
        {
          $component: 'VirtualComponent',
          props: {
            virtualTreeId: 'otherTreeId',
          },
        },
      ],
    },
    otherTreeId: {
      $component: 'slider',
      children: [
        {
          $component: 'list',
          props: {
            categoryId: 'some-category',
          },
        },
      ],
    },
  }

  const { container } = renderVirtualComponent({
    extensions: { 'store.home/VirtualComponent': {} },
    virtualTrees,
    treePath: 'store.home/VirtualComponent',
    treeId: 'someTreeId',
  })

  expect(container).toMatchInlineSnapshot(`
            <div>
              <div
                class="shelf"
              >
                <span>
                  some title
                </span>
                <ul
                  data-slider="true"
                >
                  <ul
                    data-category="some-category"
                  />
                </ul>
              </div>
            </div>
      `)
})

test(`renders a virtual block with shallow props`, () => {
  window.__RENDER_8_COMPONENTS__ = {
    div: (({ children, blockClass }: any) => (
      <div className={blockClass}>{children}</div>
    )) as any,
    rich: (({ text }: any) => <span>{text}</span>) as any,
  }

  const virtualTrees = {
    someTreeId: {
      $component: 'div',
      props: {
        blockClass: 'shelf',
      },
      children: [
        {
          $component: 'rich',
          props: {
            text: '$title',
          },
        },
      ],
    },
  }

  const { container } = renderVirtualComponent({
    extensions: { 'store.home/VirtualComponent': {} },
    virtualTrees,
    treePath: 'store.home/VirtualComponent',
    treeId: 'someTreeId',
    props: {
      title: 'Shelf custom shallow title',
    },
  })

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="shelf"
      >
        <span>
          Shelf custom shallow title
        </span>
      </div>
    </div>
  `)
})

test(`renders a virtual block with deep props`, () => {
  window.__RENDER_8_COMPONENTS__ = {
    div: (({ children, blockClass }: any) => (
      <div className={blockClass}>{children}</div>
    )) as any,
    rich: (({ text }: any) => <span>{text}</span>) as any,
  }

  const virtualTrees = {
    someTreeId: {
      $component: 'div',
      props: {
        blockClass: 'shelf',
      },
      children: [
        {
          $component: 'rich',
          props: {
            text: '$potato.title',
          },
        },
      ],
    },
  }

  const { container } = renderVirtualComponent({
    extensions: { 'store.home/VirtualComponent': {} },
    virtualTrees,
    treePath: 'store.home/VirtualComponent',
    treeId: 'someTreeId',
    props: {
      potato: {
        title: 'Shelf custom deep title',
      },
    },
  })

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="shelf"
      >
        <span>
          Shelf custom deep title
        </span>
      </div>
    </div>
  `)
})