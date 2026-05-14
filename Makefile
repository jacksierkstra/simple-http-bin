VERSION ?= patch
REMOTE ?= origin
BRANCH ?= $(shell git branch --show-current)

.PHONY: release release-patch release-minor release-major publish

release:
	npm version $(VERSION)
	git push $(REMOTE) $(BRANCH) --follow-tags
	npm publish

publish:
	npm publish

release-patch:
	$(MAKE) release VERSION=patch

release-minor:
	$(MAKE) release VERSION=minor

release-major:
	$(MAKE) release VERSION=major
