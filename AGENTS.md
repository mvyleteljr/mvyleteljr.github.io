# Project instructions

Use ASD-STE100 Simplified Technical English in all agent conversations for this project.

## Interests page

When the user asks to add content to the interests page, use these rules:

- Treat each list item or paragraph in the user's message as one item.
- Put new items at the start of the `<ul>` in `links.html`. Keep the order from the user's message.
- Put each item in one `<li>`.
- For a URL, use the page title as the link text. Put text after the URL in a `<small>` element.
- For a quote, preserve the quotation marks. Put its source in a `<small>` element.
- For a photo, put the image in the `<li>`. Put its caption in a `<small>` element.
- For all other items, put the text directly in the `<li>`.
- Escape HTML characters in text from the user.
- Do not add headings or categories.
- Ask a question only when the item cannot be added without a material change to the user's meaning.
