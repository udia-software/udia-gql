import React, { ChangeEventHandler, Component } from "react";
import { MarkdownRenderer } from "../composite/markdownRenderer";
import styled from "../static/appStyles";
import { TextArea } from "../static/formHelpers";

const STUB = `
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

interface IState {
  content: string;
}

const CreateContainer = styled.div`
  display: block;
  width: 100%;
  max-width: 100%;
`;

class CreateController extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      content: STUB
    };
  }

  public render() {
    const { content } = this.state;
    return (
      <CreateContainer>
        <TextArea value={content} onChange={this.handleChange} />
        <MarkdownRenderer value={content} />
      </CreateContainer>
    );
  }

  protected handleChange: ChangeEventHandler<HTMLTextAreaElement> = e => {
    const content = e.target.value;
    this.setState(() => ({ content }));
  };
}

export { CreateController as Create };
