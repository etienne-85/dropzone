# Tasks
**layout**
- [x] move import, export buttons at top right of page with relevant icons
- [x] add gear icon next to import/export
**first time run: installation**
- [x] show installation instruction only if no previous installation was found in local storage:
- [x] replace step3 by: "press bookmarklet to complete installation"
- [x] when bookmarklet is pressed the first time, populate local storage and mark install as done (which will prevent showing installation isntructions next time)
- [x] replace installation instruction by successful installation message
**configuration**
- [x] when clicking gear icon at top right, show config menu
- [x] allow clearing all data to come back to prior install state
**items**
- [ ] allow items to be deleted

# Main features
- [ ] duplicate detection:
 this was already saved previously: what you'd like to do?
    `cancel`, `replace`, `update`, `keep all`
- [ ] sorting mode: manual (User), auto (AI)
- [ ] categories: `unsorted`, `auto`, `manual`
- [ ] export unsorted along with categories =>
- [ ] user can add a new custom category and ask AI to re-sort items to fit into that new category

# Data sorting

## 
- one category per item
- ranking of items based on importance (defaulting to 3/5) 
- allow grouping by projects

## AI Data flow/exchange contract/format:
- input: categories[], items[]
- output: {catgory1: items1[], category2: items2[]}

## Change log
At the end of sorting process, AI will show which items were moved into different category.
User can approve or reject

## User defined prompts
Allow user to specify his own prompts to organize items

## AI prompts preset
### categories suggestions 
- user export all items + current categories from `dropzone`
- AI will suggest relevant categories that user can refine
- once confirmed, AI sort all items into each category and return output at expected format
- user reimport data into `dropzone`

### unsorted items sorting
- user export unsorted items + current categories from `dropzone`
- AI will sort provided items into current categories and return output at expected format
- user reimport new items into `dropzone`

# Data persistance
- Data will persist in browser internal storage
- User can regularly make manual backup into `github private gist`, `notion page`
- Provide `github-gist` and `notion` integrations so this can be automatically backuped

# Data visualization

# Data cleanup

# Advanced AI
- link items in between
- understand project context and is able to say how an item relates to a subject, why it was searched
- exploration: from current user's center of interest, or project context can explore and suggest new items which could be relevant (like YT videos suggestions)
- relate items, can detect which items are linked (like linkedin profiles proximity)
