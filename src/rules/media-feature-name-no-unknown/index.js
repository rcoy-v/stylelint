import {
  atRuleParamIndex,
  isStandardSyntaxMediaFeatureName,
  optionsHaveIgnoredMediaFeatureName,
  report,
  ruleMessages,
  validateOptions,
} from "../../utils"
import { isString } from "lodash"
import { mediaFeatureNames } from "../../reference/keywordSets"
import mediaParser from "postcss-media-query-parser"
import { vendor } from "postcss"

export const ruleName = "media-feature-name-no-unknown"

export const messages = ruleMessages(ruleName, {
  rejected: (mediaFeatureName) => `Unexpected unknown media feature name "${mediaFeatureName}"`,
})

export default function (actual, options) {
  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, { actual }, {
      actual: options,
      possible: {
        ignoreMediaFeatureNames: [isString],
      },
      optional: true,
    })

    if (!validOptions) { return }

    root.walkAtRules(/^media$/i, atRule => {
      mediaParser(atRule.params).walk(/^media-feature$/i, mediaFeatureNode => {
        const mediaFeatureName = mediaFeatureNode.value

        if (!isStandardSyntaxMediaFeatureName(mediaFeatureName)) { return }

        if (optionsHaveIgnoredMediaFeatureName(options, mediaFeatureName)) { return }

        if (vendor.prefix(mediaFeatureName) || mediaFeatureNames.has(mediaFeatureName.toLowerCase())) { return }

        report({
          index: atRuleParamIndex(atRule) + mediaFeatureNode.sourceIndex,
          message: messages.rejected(mediaFeatureName),
          node: atRule,
          ruleName,
          result,
        })
      })
    })
  }
}
