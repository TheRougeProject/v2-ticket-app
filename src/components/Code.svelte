<script>
  import { onMount } from 'svelte'
  import filterClasses, { cssPrefix } from '../helper-classes.js'
  import hljs from 'highlight.js/lib/core'

  hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml')) // html
  hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'))
  hljs.registerLanguage('cpp', require('highlight.js/lib/languages/cpp'))
  hljs.registerLanguage('csharp', require('highlight.js/lib/languages/csharp'))
  hljs.registerLanguage('css', require('highlight.js/lib/languages/css'))
  hljs.registerLanguage('markdown', require('highlight.js/lib/languages/markdown'))
  hljs.registerLanguage('diff', require('highlight.js/lib/languages/diff'))
  hljs.registerLanguage('go', require('highlight.js/lib/languages/go'))
  hljs.registerLanguage('ini', require('highlight.js/lib/languages/ini')) // toml
  hljs.registerLanguage('java', require('highlight.js/lib/languages/java'))
  hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
  hljs.registerLanguage('json', require('highlight.js/lib/languages/json'))
  hljs.registerLanguage('plaintext', require('highlight.js/lib/languages/plaintext'))
  hljs.registerLanguage('php', require('highlight.js/lib/languages/php'))
  hljs.registerLanguage('php-template', require('highlight.js/lib/languages/php-template'))
  hljs.registerLanguage('python', require('highlight.js/lib/languages/python'))
  hljs.registerLanguage('python-repl', require('highlight.js/lib/languages/python-repl'))
  hljs.registerLanguage('scss', require('highlight.js/lib/languages/scss'))
  hljs.registerLanguage('shell', require('highlight.js/lib/languages/shell'))
  hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'))
  hljs.registerLanguage('yaml', require('highlight.js/lib/languages/yaml'))

  export let style = null
  export let helperClass = null
  export let languages

  let importedClasses = ''
  export { importedClasses as class }
  export let classPermissiveMode = false
  if (helperClass) {
    console.warn("[DS:deprecation] please replace 'helperClass' prop by 'class'")
    if (!importedClasses) {
      importedClasses = helperClass
    }
  }
  const classes = [`${cssPrefix}hljs`]
  if (importedClasses) classes.push(...filterClasses(importedClasses, classPermissiveMode))

  let el
  onMount(() => {
    if (languages) {
      hljs.configure({
        languages
      })
    }
    hljs.highlightElement(el)
  })
</script>

<div class={classes.join(' ')} {style}>
  <pre bind:this={el}><code><slot /></code></pre>
</div>
