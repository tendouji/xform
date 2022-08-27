import { animationTime as globalAnimationTime } from "../constants";

const SHOW_HIDE_CLICK_BUTTON_SELECTOR = "[data-xform='show-hide-click-button']";
const SHOW_HIDE_CLICK_CONTENT_SELECTOR = "[data-xform='show-hide-click-content']";

class ShowHideClick {
  $showHideClickContent = null;
  $showHideClickButton = null;
  $showHideClickButtonTextElement = null;
  buttonOpenText = "";
  buttonCloseText = "";
  isDefaultOpen = false;
  animationTime = globalAnimationTime * 2;
  isOpenClassName = "is-open";

  static initialise() {
    const $showHideClickContents = document.querySelectorAll(SHOW_HIDE_CLICK_CONTENT_SELECTOR);
    [...$showHideClickContents].forEach(($showHideClickContent) => {
      /* eslint-disable-next-line no-unused-vars */
      const showHideClick = new ShowHideClick($showHideClickContent);
    });
  }

  constructor($showHideClickContent) {
    this.$showHideClickContent = $showHideClickContent;
    const {
      xformShowHideClickButtonId,
      xformShowHideClickButtonOpenText,
      xformShowHideClickButtonCloseText,
      xformShowHideClickIsDefaultOpen
    } = this.$showHideClickContent.dataset;

    if (xformShowHideClickButtonId) {
      this.$showHideClickButton = document.querySelector(
        `${SHOW_HIDE_CLICK_BUTTON_SELECTOR}[data-xform-show-hide-click-button-id="${xformShowHideClickButtonId}"]`
      );
    }

    this.buttonOpenText = xformShowHideClickButtonOpenText || "";
    this.buttonCloseText = xformShowHideClickButtonCloseText || "";
    this.isDefaultOpen = xformShowHideClickIsDefaultOpen === "true";
    this.$showHideClickContent.classList.toggle(this.isOpenClassName, this.isDefaultOpen);

    if (this.$showHideClickButton) {
      this.$showHideClickButtonTextElement = this.$showHideClickButton.querySelector("span.text");
      this.$showHideClickButton.type = "button";
      this.$showHideClickButton.addEventListener("click", () => {
        if (this.$showHideClickButton.classList.contains(this.isOpenClassName)) {
          this.slideUp();
        } else {
          this.slideDown();
        }
      });
      this.setButtonStatus(!this.isDefaultOpen);
    }
  }

  slideDown() {
    const $currentElement = this.$showHideClickContent;
    const { style: targetStyle } = $currentElement;
    targetStyle.display = "block";
    targetStyle.overflow = "hidden";
    targetStyle.height = "auto"; // NOTE: temporarily make element visible to get height
    const { height: offsetHeight } = $currentElement.getBoundingClientRect();
    targetStyle.height = 0;
    setTimeout(() => {
      targetStyle.height = `${offsetHeight}px`;
      this.setButtonStatus(false);
    }, 0);
    setTimeout(() => {
      $currentElement.classList.add(this.isOpenClassName);
      ShowHideClick.removeStylePropertyByBatch($currentElement, ["display", "height", "overflow"]);
    }, this.animationTime);
  }

  slideUp() {
    const $currentElement = this.$showHideClickContent;
    const { height: offsetHeight } = $currentElement.getBoundingClientRect();
    const { style: targetStyle } = $currentElement;
    targetStyle.overflow = "hidden";
    targetStyle.height = `${offsetHeight}px`;
    setTimeout(() => {
      targetStyle.height = 0;
      this.setButtonStatus();
    }, 0);
    setTimeout(() => {
      ShowHideClick.removeStylePropertyByBatch($currentElement, ["height", "overflow"]);
      $currentElement.classList.remove(this.isOpenClassName);
    }, this.animationTime);
  }

  static removeStylePropertyByBatch($element, propertyList) {
    propertyList.forEach((property) => $element.style.removeProperty(property));
  }

  setButtonStatus(isClosed = true) {
    this.$showHideClickButtonTextElement.innerText = isClosed
      ? this.buttonOpenText
      : this.buttonCloseText;
    this.$showHideClickButton.classList.toggle(this.isOpenClassName, !isClosed);
  }
}

export { ShowHideClick };
