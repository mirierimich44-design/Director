
/**
 * Centralized Syntax Balancer for TSX Code.
 * Correctly handles nested template literals, strings, and comments.
 */
export function balanceBraces(code) {
    let balanced = code;
    const stack = []; // Stores '{', '(', '[', '`', '<'
    const revMatching = { '{': '}', '(': ')', '[': ']', '`': '`', '<': ' />' };

    let inString = null; // null, "'", '"', or '`'
    let inComment = null; // null, '//', or '/*'

    for (let i = 0; i < balanced.length; i++) {
        const char = balanced[i];
        const nextChar = balanced[i + 1];

        // 1. Comment handling (highest priority)
        if (!inString) {
            if (!inComment) {
                if (char === '/' && nextChar === '/') { inComment = '//'; i++; continue; }
                if (char === '/' && nextChar === '*') { inComment = '/*'; i++; continue; }
            } else {
                if (inComment === '//' && char === '\n') { inComment = null; continue; }
                if (inComment === '/*' && char === '*' && nextChar === '/') { inComment = null; i++; continue; }
                continue;
            }
        }
        if (inComment) continue;

        // 2. String & Interpolation handling
        const isEscaped = (() => {
            let count = 0;
            let j = i - 1;
            while (j >= 0 && balanced[j] === '\\') { count++; j--; }
            return count % 2 !== 0;
        })();

        if (!inString) {
            // Not in a string -> can start one
            if (char === "'" || char === '"' || char === '`') {
                inString = char;
            } else if ('{(['.includes(char)) {
                stack.push(char);
            } else if (char === '<' && /[a-zA-Z]/.test(nextChar || '')) {
                // Potential JSX tag start: < followed by a letter
                stack.push('<');
            } else if (char === '>' && stack.length > 0) {
                // If we see > but stack has { ([, it means we closed a tag while inside a block
                // OR we are at the end of a tag like <div style={{...} >
                if (stack[stack.length - 1] === '<') {
                    stack.pop();
                } else if (stack.includes('<')) {
                    // Check if there are any other delimiters above the most recent '<'
                    let foundOtherAbove = false;
                    for (let j = stack.length - 1; j >= 0; j--) {
                        if (stack[j] === '<') break;
                        foundOtherAbove = true;
                        break;
                    }

                    if (!foundOtherAbove) {
                        // This is actually a tag closure context.
                        // Pop everything until < (should only be <)
                        while (stack.length > 0 && stack[stack.length - 1] !== '<') {
                            const open = stack.pop();
                            const close = revMatching[open] || '';
                            balanced = balanced.slice(0, i) + close + balanced.slice(i);
                            i += close.length;
                        }
                        if (stack.length > 0 && stack[stack.length - 1] === '<') {
                            stack.pop();
                        }
                    }
                }
            } else if ('})]'.includes(char)) {
                const expected = char === '}' ? '{' : char === ')' ? '(' : '[';
                if (stack.length > 0) {
                    const top = stack[stack.length - 1];
                    if (top === expected) {
                        stack.pop();
                    } else if (char === '}' && top === '`') {
                        // End of interpolation ${ ... }
                        stack.pop();
                        inString = '`'; // Restore template literal state
                    }
                }
            }
        } else {
            // Inside a string
            if (char === inString && !isEscaped) {
                inString = null; // End of string
            } else if (inString === '`' && char === '$' && nextChar === '{' && !isEscaped) {
                // Start of interpolation ${
                stack.push('`'); // Marker to restore inString='`' later
                inString = null; // Transition to code context
                i++; // Skip '{'
            }
            // All other characters in a string are ignored for balancing
        }
    }

    // Phase 2: Healing

    // 1. Close unclosed comment
    if (inComment === '/*') balanced += ' */';

    // 2. Prevent hanging operators
    // Only if we're currently in a code context (not in a literal string)
    if (!inString) {
        const trimmed = balanced.trimEnd();
        if (trimmed.length > 0) {
            const last = trimmed[trimmed.length - 1];
            if (':=+,!&|?<>/*'.includes(last)) {
                // Ensure it's not the end of a /* comment (already handled)
                if (!(last === '/' && trimmed[trimmed.length - 2] === '*')) {
                    balanced += ' null';
                    if (stack.length === 0) balanced += ';';
                }
            }
        }
    }

    // 3. Close unclosed string/template literal
    if (inString) {
        balanced += inString;
        if (stack.length === 0) balanced += ';';
    }

    // 4. Close unclosed scopes (including interpolations)
    if (stack.length > 0) {
        let tail = '';
        while (stack.length > 0) {
            const open = stack.pop();
            tail += revMatching[open] || '';
        }
        balanced += '\n' + tail + ';';
    }

    return balanced;
}
