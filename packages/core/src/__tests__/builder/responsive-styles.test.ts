import { componentToBuilder } from '@/generators/builder';
import { componentToMitosis } from '@/generators/mitosis';
import { describe, expect, test } from 'vitest';
import {
  builderContentToMitosisComponent,
  getStyleStringFromBlock,
} from '../../parsers/builder/builder';

const options = {
  escapeInvalidCode: true,
  includeMeta: true,
  includeSpecialBindings: true,
};

describe('Responsive Styles', () => {
  test('preserve bound media query styles when converting to mitosis', () => {
    const content = {
      data: {
        blocks: [
          {
            '@type': '@builder.io/sdk:Element' as const,
            bindings: {
              'responsiveStyles.small.left': 'state.left',
              'responsiveStyles.small.top': 'state.top',
              'responsiveStyles.large.color': 'state.color',
              'style.fontSize': 'state.fontSize',
              'style.background': '"red"',
              'responsiveStyles.large.background': '"green"',
              'component.options.responsiveStyles.medium.flexDirection':
                'state.reverseColumnsWhenStacked && (state.stackColumnsAt === "tablet" || state.stackColumnsAt === "mobile") ? "column-reverse" : undefined',
              'component.options.responsiveStyles.small.color': '"red"',
              'component.options.responsiveStyles.medium.color': '"green"',
              'component.options.responsiveStyles.large.color': '"blue"',
            },
          },
        ],
      },
    };

    const result = getStyleStringFromBlock(content.data.blocks[0], options);

    // Should contain both media queries
    expect(result).toContain('@media (max-width: 1200px)');
    expect(result).toContain('@media (max-width: 640px)');
    expect(result).toContain('@media (max-width: 991px)');

    // Should contain the correct flexDirection bindings
    expect(result).toContain(
      'flexDirection: state.reverseColumnsWhenStacked && (state.stackColumnsAt === "tablet" || state.stackColumnsAt === "mobile") ? "column-reverse" : undefined',
    );

    const mitosis = builderContentToMitosisComponent(content);

    expect(mitosis.children[0].bindings).toMatchInlineSnapshot(`
      {
        "responsiveStyles.large.color": {
          "bindingType": "expression",
          "code": "\\"blue\\"",
          "type": "single",
        },
        "responsiveStyles.medium.color": {
          "bindingType": "expression",
          "code": "\\"green\\"",
          "type": "single",
        },
        "responsiveStyles.medium.flexDirection": {
          "bindingType": "expression",
          "code": "state.reverseColumnsWhenStacked && (state.stackColumnsAt === \\"tablet\\" || state.stackColumnsAt === \\"mobile\\") ? \\"column-reverse\\" : undefined",
          "type": "single",
        },
        "responsiveStyles.small.color": {
          "bindingType": "expression",
          "code": "\\"red\\"",
          "type": "single",
        },
        "style": {
          "bindingType": "expression",
          "code": "{ fontSize: state.fontSize, background: \\"red\\", \\"@media (max-width: 640px)\\": { left: state.left, top: state.top, color: \\"red\\" }, \\"@media (max-width: 1200px)\\": { color: \\"blue\\", background: \\"green\\" }, \\"@media (max-width: 991px)\\": { flexDirection: state.reverseColumnsWhenStacked && (state.stackColumnsAt === \\"tablet\\" || state.stackColumnsAt === \\"mobile\\") ? \\"column-reverse\\" : undefined, color: \\"green\\" }, }",
          "type": "single",
        },
      }
    `);

    const jsx = componentToMitosis()({ component: mitosis });

    expect(jsx).toMatchInlineSnapshot(`
      "export default function MyComponent(props) {
        return (
          <div
            style={{
              fontSize: state.fontSize,
              background: \\"red\\",
              \\"@media (max-width: 640px)\\": {
                left: state.left,
                top: state.top,
                color: \\"red\\",
              },
              \\"@media (max-width: 1200px)\\": {
                color: \\"blue\\",
                background: \\"green\\",
              },
              \\"@media (max-width: 991px)\\": {
                flexDirection:
                  state.reverseColumnsWhenStacked &&
                  (state.stackColumnsAt === \\"tablet\\" ||
                    state.stackColumnsAt === \\"mobile\\")
                    ? \\"column-reverse\\"
                    : undefined,
                color: \\"green\\",
              },
            }}
          />
        );
      }
      "
    `);

    const json = componentToBuilder()({ component: mitosis });
    expect(json).toMatchInlineSnapshot(`
        {
          "data": {
            "blocks": [
              {
                "@type": "@builder.io/sdk:Element",
                "actions": {},
                "bindings": {
                  "responsiveStyles.large.background": "\\"green\\"",
                  "responsiveStyles.large.color": "\\"blue\\"",
                  "responsiveStyles.medium.color": "\\"green\\"",
                  "responsiveStyles.medium.flexDirection": "state.reverseColumnsWhenStacked && (state.stackColumnsAt === \\"tablet\\" || state.stackColumnsAt === \\"mobile\\") ? \\"column-reverse\\" : undefined",
                  "responsiveStyles.small.color": "\\"red\\"",
                  "responsiveStyles.small.left": "state.left",
                  "responsiveStyles.small.top": "state.top",
                  "style.background": "\\"red\\"",
                  "style.fontSize": "state.fontSize",
                },
                "children": [],
                "code": {
                  "actions": {},
                  "bindings": {},
                },
                "properties": {},
                "tagName": "div",
              },
            ],
            "jsCode": "",
            "tsCode": "",
          },
        }
      `);
  });
});
