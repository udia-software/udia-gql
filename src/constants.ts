export const NODE_ENV = process.env.NODE_ENV || "development";
export const JWT_SECRET = process.env.JWT_SECRET || "DEVELOPMENT_JWT_SECRET";
export const COOKIE_SECRET = process.env.COOKIE_SECRET || "DEVELOPMENT_COOKIE_SECRET";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const USERS_TABLE = process.env.USERS_TABLE || "users-udia-gql-dev";
export const DYNAMODB_STAGE = process.env.DYNAMODB_STAGE || "dev";
export const DYNAMODB_ENDPOINT = DYNAMODB_STAGE === "prod" ? undefined : (
  process.env.DYNAMODB_ENDPOINT || "http://localhost:8000");
export const DYNAMODB_REGION = process.env.DYNAMODB_REGION || "us-west-2";
export const DYNAMODB_KEY_ID = process.env.DYNAMODB_KEY_ID || "AKIAIOSFODNN7EXAMPLE";
export const DYNAMODB_KEY_SECRET = process.env.DYNAMODB_KEY_SECRET || "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
// Namespaces used for UUIDv5 payloadId generation
export const USERS_UUID_NS = "0d1a1d1a-2d1a-3d1a-4d1a-5d1a6d1a7d1a";
export const EMAILS_UUID_NS = "1d1a1d1a-2d1a-3d1a-4d1a-5d1a6d1a7d1a";
export const SIGN_UUID_NS = "2d1a1d1a-2d1a-3d1a-4d1a-5d1a6d1a7d1a";
export const ENCRYPT_UUID_NS = "3d1a1d1a-2d1a-3d1a-4d1a-5d1a6d1a7d1a";

export const STUB = `
# Katex

## Block Examples

Example 1

$$
f(x) = \\int_{-\\infty}^\\infty\\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi
$$

Example 2

$$
\\frac{1}{\\Bigl(\\sqrt{\\phi \\sqrt{5}}-\\phi\\Bigr) e^{\\frac25 \\pi}} = 1+
\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}} {1+\\frac{e^{-8\\pi}} {1+\\cdots} } } }
$$

Example 3

$$
1 +  \\frac{q^2}{(1-q)}+\\frac{q^6}{(1-q)(1-q^2)}+\\cdots = \\prod_{j=0}^{\\infty}
\\frac{1}{(1-q^{5j+2})(1-q^{5j+3})}, \\quad\\quad \\text{for }\\lvert q\\rvert<1.
$$

## Inline Examples

Inline $f(x) = \\int_{-\\infty}^\\infty\\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi$ function went here

Inline $\\frac{1}{\\Bigl(\\sqrt{\\phi \\sqrt{5}}-\\phi\\Bigr) e^{\\frac25 \\pi}} = 1+
\\frac{e^{-2\\pi}} {1+\\frac{e^{-4\\pi}} {1+\\frac{e^{-6\\pi}} {1+\\frac{e^{-8
\\pi}} {1+\\cdots} } } }$ function went here

Inline $1 +  \\frac{q^2}{(1-q)}+\\frac{q^6}{(1-q)(1-q^2)}+\\cdots = \\prod_{j=0}^{\\infty}
\\frac{1}{(1-q^{5j+2})(1-q^{5j+3})}, \\quad\\quad \\text{for }\\lvert q\\rvert<1.$ function went here

This is a paragraph.

    This is a paragraph.



Header 1
========

Header 2
--------

    Header 1
    ========

    Header 2
    --------



# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6

    # Header 1
    ## Header 2
    ### Header 3
    #### Header 4
    ##### Header 5
    ###### Header 6



# Header 1 #
## Header 2 ##
### Header 3 ###
#### Header 4 ####
##### Header 5 #####
###### Header 6 ######

    # Header 1 #
    ## Header 2 ##
    ### Header 3 ###
    #### Header 4 ####
    ##### Header 5 #####
    ###### Header 6 ######



> Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.

    > Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
    Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.



> ## This is a header.
> 1. This is the first list item.
> 2. This is the second list item.
>
> Here's some example code:
>
>     Markdown.generate();

    > ## This is a header.
    > 1. This is the first list item.
    > 2. This is the second list item.
    >
    > Here's some example code:
    >
    >     Markdown.generate();




- Red
- Green
- Blue


+ Red
+ Green
+ Blue


* Red
* Green
* Blue


\`\`\`markdown
- Red
- Green
- Blue

+ Red
+ Green
+ Blue

* Red
* Green
* Blue
\`\`\`



1. Buy flour and salt
1. Mix together with water
1. Bake

\`\`\`markdown
1. Buy flour and salt
1. Mix together with water
1. Bake
\`\`\`



Paragraph:

    Code

<!-- -->

    Paragraph:

        Code



* * *

***

*****

- - -

---------------------------------------

    * * *

    ***

    *****

    - - -

    ---------------------------------------



This is [an example](http://example.com "Example") link.

[This link](http://example.com) has no title attr.

This is [an example] [id] reference-style link.

[id]: http://example.com "Optional Title"

    This is [an example](http://example.com "Example") link.

    [This link](http://example.com) has no title attr.

    This is [an example] [id] reference-style link.

    [id]: http://example.com "Optional Title"



*single asterisks*

_single underscores_

**double asterisks**

__double underscores__

    *single asterisks*

    _single underscores_

    **double asterisks**

    __double underscores__



This paragraph has some \`code\` in it.

    This paragraph has some \`code\` in it.



![Alt Text](https://placehold.it/200x50 "Image Title")

    ![Alt Text](https://placehold.it/200x50 "Image Title")`;
