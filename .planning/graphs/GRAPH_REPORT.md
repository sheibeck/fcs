# Graph Report - fcs  (2026-07-23)

## Corpus Check
- 98 files · ~128,397 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 872 nodes · 1062 edges · 100 communities (74 shown, 26 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1e68b415`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_UserService|UserService]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_characterprops.vue|characterprops.vue]]
- [[_COMMUNITY_SceneDetail.vue|SceneDetail.vue]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_scene-object.vue|scene-object.vue]]
- [[_COMMUNITY_CommonService|CommonService]]
- [[_COMMUNITY_scene-zone.vue|scene-zone.vue]]
- [[_COMMUNITY_manifest.json|manifest.json]]
- [[_COMMUNITY_GameClient|GameClient]]
- [[_COMMUNITY_Architecture|Architecture]]
- [[_COMMUNITY_fate-anything.vue|fate-anything.vue]]
- [[_COMMUNITY_CharacterDetail.vue|CharacterDetail.vue]]
- [[_COMMUNITY_Models|Models]]
- [[_COMMUNITY_AdversaryList.vue|AdversaryList.vue]]
- [[_COMMUNITY_Architecture|Architecture]]
- [[_COMMUNITY_Coding Conventions|Coding Conventions]]
- [[_COMMUNITY_Testing Patterns|Testing Patterns]]
- [[_COMMUNITY_commonService.js|commonService.js]]
- [[_COMMUNITY_GameServer|GameServer]]
- [[_COMMUNITY_CampaignDetail.vue|CampaignDetail.vue]]
- [[_COMMUNITY_Codebase Concerns|Codebase Concerns]]
- [[_COMMUNITY_DbService|DbService]]
- [[_COMMUNITY_External Integrations|External Integrations]]
- [[_COMMUNITY_FateOf20|FateOf20]]
- [[_COMMUNITY_charactersheet.vue|charactersheet.vue]]
- [[_COMMUNITY_SceneList.vue|SceneList.vue]]
- [[_COMMUNITY_getScene|getScene]]
- [[_COMMUNITY_Technology Stack|Technology Stack]]
- [[_COMMUNITY_Codebase Structure|Codebase Structure]]
- [[_COMMUNITY_CampaignSummary.vue|CampaignSummary.vue]]
- [[_COMMUNITY_CharacterList.vue|CharacterList.vue]]
- [[_COMMUNITY_models.js|models.js]]
- [[_COMMUNITY_scene-stress.vue|scene-stress.vue]]
- [[_COMMUNITY_CampaignList.vue|CampaignList.vue]]
- [[_COMMUNITY_attachListeners|attachListeners]]
- [[_COMMUNITY_FCSVTTClient|FCSVTTClient]]
- [[_COMMUNITY_roll20.client.js|roll20.client.js]]
- [[_COMMUNITY_Home.vue|Home.vue]]
- [[_COMMUNITY_sheetinputs.spec.js|sheetinputs.spec.js]]
- [[_COMMUNITY_adversary.spec.js|adversary.spec.js]]
- [[_COMMUNITY_character.spec.js|character.spec.js]]
- [[_COMMUNITY_.Notify|.Notify]]
- [[_COMMUNITY_copyChatToCampaign|copyChatToCampaign]]
- [[_COMMUNITY_manifest.json|manifest.json]]
- [[_COMMUNITY_charactersheet.spec.js|charactersheet.spec.js]]
- [[_COMMUNITY_charactersheet.spec.js|charactersheet.spec.js]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_data|data]]
- [[_COMMUNITY_init|init]]
- [[_COMMUNITY_initialize|initialize]]
- [[_COMMUNITY_sendToVTT|sendToVTT]]
- [[_COMMUNITY_home.spec.js|home.spec.js]]

## God Nodes (most connected - your core abstractions)
1. `CommonService` - 62 edges
2. `DbService` - 27 edges
3. `Models` - 23 edges
4. `GameClient` - 22 edges
5. `UserService` - 22 edges
6. `GameServer` - 13 edges
7. `Architecture` - 12 edges
8. `FateOf20` - 11 edges
9. `Coding Conventions` - 11 edges
10. `Testing Patterns` - 11 edges

## Surprising Connections (you probably didn't know these)
- `setupScene()` --calls--> `attachListeners()`  [EXTRACTED]
  src/pages/SceneDetail.vue → src/pages/SceneDetail.vue  _Bridges community 29 → community 42_

## Import Cycles
- None detected.

## Communities (100 total, 26 thin omitted)

### Community 0 - "UserService"
Cohesion: 0.06
Nodes (5): debug(), getElementName(), populateFormElement(), SubService, UserService

### Community 1 - "devDependencies"
Cohesion: 0.05
Nodes (43): devDependencies, amazon-cognito-identity-js, @babel/core, babel-jest, babel-loader, @babel/plugin-proposal-class-properties, @babel/preset-env, clean-webpack-plugin (+35 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (26): author, description, jest, moduleFileExtensions, moduleNameMapper, snapshotSerializers, transform, keywords (+18 more)

### Community 3 - "characterprops.vue"
Cohesion: 0.08
Nodes (6): clearTemplateSelection(), created(), deleteTemplate(), exists(), hasPortraitUrl(), init()

### Community 4 - "SceneDetail.vue"
Cohesion: 0.07
Nodes (5): chatLog(), getObjectDiff(), hasSceneChanged(), models, ScrollChatToBottom()

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (27): dependencies, aws-sdk, bootbox, bootstrap, bootstrap-vue, font-picker-vue, @fortawesome/fontawesome-free, interactjs (+19 more)

### Community 6 - "scene-object.vue"
Cohesion: 0.08
Nodes (3): init(), models, mounted()

### Community 8 - "scene-zone.vue"
Cohesion: 0.11
Nodes (10): characterExists(), convertThingToGameObject(), created(), data(), init(), makeGameObject(), models, searchCharacters() (+2 more)

### Community 9 - "manifest.json"
Cohesion: 0.09
Nodes (21): background, persistent, scripts, browser_action, default_icon, default_title, content_scripts, default_locale (+13 more)

### Community 11 - "Architecture"
Cohesion: 0.10
Nodes (19): Anti-Patterns, Architectural Constraints, Architecture, Component Responsibilities, Cross-Cutting Concerns, Custom Events for Internal Communication, Data Flow, Direct AWS SDK Usage in Components (+11 more)

### Community 12 - "fate-anything.vue"
Cohesion: 0.14
Nodes (11): addAspect(), addConsequence(), addSkill(), addStressBox(), addStressTrack(), created(), getNextId(), getStressTrackLabel() (+3 more)

### Community 13 - "CharacterDetail.vue"
Cohesion: 0.15
Nodes (5): DbTools, init(), migrateData(), mounted(), show()

### Community 16 - "Architecture"
Cohesion: 0.17
Nodes (10): Architecture, Commands, DynamoDB data model, Entry point and global state, Environment / build behavior, Project, Routing and pages, Service layer (`src/assets/js/`) (+2 more)

### Community 17 - "Coding Conventions"
Cohesion: 0.17
Nodes (11): Code Style, Coding Conventions, Comments, Error Handling, Function Design, Import Organization, Logging, Module Design (+3 more)

### Community 18 - "Testing Patterns"
Cohesion: 0.17
Nodes (11): Common Patterns, Coverage, Fixtures and Factories, LocalVue Pattern, Mocking, Module Resolution, Test File Organization, Test Framework (+3 more)

### Community 21 - "CampaignDetail.vue"
Cohesion: 0.20
Nodes (3): created(), data(), init()

### Community 22 - "Codebase Concerns"
Cohesion: 0.18
Nodes (10): Codebase Concerns, Dependencies at Risk, Fragile Areas, Known Bugs, Missing Critical Features, Performance Bottlenecks, Scaling Limits, Security Considerations (+2 more)

### Community 24 - "External Integrations"
Cohesion: 0.20
Nodes (9): APIs & External Services, Authentication & Identity, AWS Services, CI/CD & Deployment, Data Storage, Environment Configuration, External Integrations, Monitoring & Observability (+1 more)

### Community 26 - "charactersheet.vue"
Cohesion: 0.27
Nodes (4): formatVTTMessage(), getVal(), parseVTTMessage(), sendToVTT()

### Community 27 - "SceneList.vue"
Cohesion: 0.24
Nodes (3): data(), init(), mounted()

### Community 29 - "getScene"
Cohesion: 0.22
Nodes (9): configureUser(), exitGame(), getPlayer(), getScene(), getUserName(), joinGame(), setupScene(), toggleFullScreen() (+1 more)

### Community 30 - "Technology Stack"
Cohesion: 0.25
Nodes (7): Configuration, Frameworks, Key Dependencies, Languages, Platform Requirements, Runtime, Technology Stack

### Community 31 - "Codebase Structure"
Cohesion: 0.25
Nodes (7): Codebase Structure, Directory Layout, Directory Purposes, Key File Locations, Naming Conventions, Special Directories, Where to Add New Code

### Community 34 - "CharacterList.vue"
Cohesion: 0.32
Nodes (3): data(), init(), mounted()

### Community 41 - "CampaignList.vue"
Cohesion: 0.38
Nodes (3): data(), init(), mounted()

### Community 42 - "attachListeners"
Cohesion: 0.33
Nodes (7): attachListeners(), sendChatMessage(), sendFormattedChat(), sendSystemMessage(), setupGameServer(), updateChatLog(), updatePlayer()

### Community 63 - "roll20.client.js"
Cohesion: 0.67
Nodes (3): chat, handleListener(), roll20ChatMessage()

### Community 80 - "copyChatToCampaign"
Cohesion: 0.67
Nodes (3): clearChatLog(), copyChatToCampaign(), selectCampaignResult()

## Knowledge Gaps
- **196 isolated node(s):** `chat`, `name`, `version`, `manifest_version`, `description` (+191 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CommonService` connect `CommonService` to `UserService`, `characterprops.vue`, `SceneDetail.vue`, `scene-object.vue`, `scene-zone.vue`, `CharacterDetail.vue`, `AdversaryList.vue`, `commonService.js`, `CampaignDetail.vue`, `FateOf20`, `charactersheet.vue`, `SceneList.vue`, `AdversaryDetail.vue`, `CampaignSummary.vue`, `CharacterList.vue`, `CharacterSheetDetail.vue`, `models.js`, `scene-aspect.vue`, `scene-stress.vue`, `CampaignList.vue`, `dbService.js`, `scene-consequence.vue`, `scene-skill.vue`, `scene-stuntextra.vue`, `.Notify`, `search.vue`, `Recover.vue`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`, `.Notify`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `chat`, `name`, `version` to the rest of the system?**
  _196 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UserService` be split into smaller, more focused modules?**
  _Cohesion score 0.061224489795918366 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._