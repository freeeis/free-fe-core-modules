import postcss from 'postcss';
import nested from 'postcss-nested';

export const SCOPED_STYLE_ATTRIBUTE = 'data-free-style-scope';
export const FLOW_STYLE_SCOPE_ATTRIBUTE = SCOPED_STYLE_ATTRIBUTE;

const SAFE_SCOPE_TOKEN = /^[a-zA-Z0-9_-]+$/;
const LOCAL_SELECTOR = /^&(?=$|[:.[#>\s])/;
const ROOT_SIBLING_SELECTOR = /^&\s*[+~]/;
let nextScopeId = 0;

const selectorBranches = (selector) => postcss.list.comma(selector)
  .map((branch) => branch.trim())
  .filter(Boolean);

const validateSourceContainer = (container) => {
  container.each((node) => {
    if (node.type === 'decl' || node.type === 'comment') return;

    if (node.type === 'rule') {
      const branches = selectorBranches(node.selector);
      if (!branches.length || branches.some((branch) => (
        !LOCAL_SELECTOR.test(branch) || ROOT_SIBLING_SELECTOR.test(branch)
      ))) {
        throw node.error('嵌套选择器必须以 & 开头，且不能选择作用域根的兄弟元素');
      }
      validateSourceContainer(node);
      return;
    }

    if (node.type === 'atrule' && node.name.toLowerCase() === 'media' && node.nodes) {
      validateSourceContainer(node);
      return;
    }

    throw node.error(`不支持 @${node.name || node.type}`);
  });
};

const validateCompiledStyles = (root, scopeSelector) => {
  root.walkRules((rule) => {
    const branches = selectorBranches(rule.selector);
    const escaped = !branches.length || branches.some((branch) => {
      if (!branch.startsWith(scopeSelector)) return true;
      const remainder = branch.slice(scopeSelector.length);
      return /^\s*[+~]/.test(remainder);
    });

    if (escaped) {
      throw rule.error('生成的选择器超出了当前样式作用域');
    }
  });
};

export const createStyleScopeSelector = (scopeToken) => {
  if (!SAFE_SCOPE_TOKEN.test(scopeToken || '')) {
    throw new TypeError('样式作用域标识只能包含字母、数字、下划线和连字符');
  }
  return `[${SCOPED_STYLE_ATTRIBUTE}="${scopeToken}"]`;
};

export const createFlowStyleScopeSelector = createStyleScopeSelector;

const parseScopedSource = (styles, scopeToken) => {
  const scopeSelector = createStyleScopeSelector(scopeToken);
  const sourceRoot = postcss.parse(`${scopeSelector} {\n${styles}\n}`);
  if (sourceRoot.nodes.length !== 1 || sourceRoot.first.type !== 'rule'
    || sourceRoot.first.selector !== scopeSelector) {
    throw sourceRoot.error('样式内容超出了当前作用域');
  }
  validateSourceContainer(sourceRoot.first);
  return { scopeSelector, sourceRoot };
};

export const extractRootDeclarations = (styles) => {
  if (typeof styles !== 'string' || !styles.trim()) return '';

  try {
    const { sourceRoot } = parseScopedSource(styles, 'declarations');
    return sourceRoot.first.nodes
      .filter((node) => node.type === 'decl' || node.type === 'comment')
      .map((node) => node.toString())
      .join('\n');
  } catch {
    return '';
  }
};

export const compileScopedStyles = (styles, scopeToken, options = {}) => {
  if (typeof styles !== 'string' || !styles.trim()) return '';

  try {
    const { scopeSelector, sourceRoot } = parseScopedSource(styles, scopeToken);
    if (options.includeRootDeclarations === false) {
      sourceRoot.first.nodes
        .filter((node) => node.type === 'decl' || node.type === 'comment')
        .forEach((node) => node.remove());
      if (!sourceRoot.first.nodes.length) return '';
    }
    const result = postcss([nested]).process(sourceRoot, { from: undefined });
    const compiledRoot = postcss.parse(result.css);
    validateCompiledStyles(compiledRoot, scopeSelector);
    return compiledRoot.toString();
  } catch {
    return '';
  }
};

export const createManagedScopedStyle = (scopePrefix = 'scope', options = {}) => {
  nextScopeId += 1;
  const safePrefix = String(scopePrefix).replace(/[^a-zA-Z0-9_-]/g, '-') || 'scope';
  const scopeToken = `${safePrefix}-${nextScopeId}`;
  let styleElement;

  const destroy = () => {
    if (styleElement) styleElement.remove();
    styleElement = undefined;
  };

  const update = (styles) => {
    const css = compileScopedStyles(styles, scopeToken, options);
    if (!css || typeof document === 'undefined') {
      destroy();
      return false;
    }

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.setAttribute(SCOPED_STYLE_ATTRIBUTE, scopeToken);
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
    return true;
  };

  return {
    scopeToken,
    update,
    destroy,
  };
};
