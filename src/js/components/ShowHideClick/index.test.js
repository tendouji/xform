import "@testing-library/jest-dom";
import { animationTime } from "../../constants.js";
import { ShowHideClick } from "./index.js";

("use strict");

describe("Test ShowHideClick UI behaviour", () => {
  let $componentContent = null;
  let $componentButton = null;
  let $componentButtonText = null;
  let buttonOpenText = "";
  let buttonCloseText = "";
  let isDefaultOpen = false;
  const isOpenClassName = "is-open";

  const getBoundingClientRectMock = jest.fn(() => {
    const defaultObj = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
    return {
      ...defaultObj,
      ...($componentContent.classList.contains(isOpenClassName) ? { width: 300, height: 300 } : {})
    };
  });

  beforeEach(() => {
    document.body.innerHTML = `
      <button data-xform="show-hide-click-button" data-xform-show-hide-click-button-id="xbutton">
        <span class="text"></span>
      </button>
      <div
        class="why"
        data-xform="show-hide-click-content"
        data-xform-show-hide-click-button-id="xbutton"
        data-xform-show-hide-click-button-open-text="Show content"
        data-xform-show-hide-click-button-close-text="Close content"
      >
        <div class="simple-container">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras metus diam, hendrerit et dui a, eleifend
            lobortis odio. Pellentesque eleifend auctor molestie. Vivamus dignissim tortor eros, egestas varius nisl
            euismod eu. Cras dictum egestas leo, et cursus ante mollis id. Vestibulum consequat magna nec diam pulvinar
            porttitor.
          </p>
        </div>  
      </div>
    `;

    $componentContent = document.querySelector('[data-xform="show-hide-click-content"]');
    $componentButton = document.querySelector('[data-xform="show-hide-click-button"]');
    $componentButtonText = $componentButton.querySelector("span.text");
    const {
      xformShowHideClickButtonOpenText,
      xformShowHideClickButtonCloseText,
      xformShowHideClickIsDefaultOpen
    } = $componentContent.dataset;
    buttonOpenText = xformShowHideClickButtonOpenText;
    buttonCloseText = xformShowHideClickButtonCloseText;
    isDefaultOpen = xformShowHideClickIsDefaultOpen;
    $componentContent.getBoundingClientRect = getBoundingClientRectMock;
  });
  describe("ShowHideClick default state", () => {
    test("Able to set given text to target button", () => {
      ShowHideClick.initialise();
      expect($componentButtonText.innerText).toBe(buttonOpenText);
    });

    test("By default is closed", () => {
      ShowHideClick.initialise();
      expect($componentButton).not.toHaveClass(isOpenClassName);
      expect($componentContent).not.toHaveClass(isOpenClassName);
      const { height } = $componentContent.getBoundingClientRect();
      expect(height).toEqual(0);
    });

    test("When target button clicked, content is opened", (done) => {
      ShowHideClick.initialise();
      $componentButton.click();
      setTimeout(() => {
        expect($componentButton).toHaveClass(isOpenClassName);
        expect($componentContent).toHaveClass(isOpenClassName);
        expect($componentButtonText.innerText).toBe(buttonCloseText);
        const { height } = $componentContent.getBoundingClientRect();
        expect(height).toBeGreaterThan(0);
        done();
      }, animationTime * 2);
    });
  });

  describe('ShowHideClick with `data-xform-show-hide-click-is-default-open="true"`', () => {
    beforeEach(() => {
      $componentContent.dataset.xformShowHideClickIsDefaultOpen = "true";
    });

    test("Target button text to use `buttonCloseText`", () => {
      ShowHideClick.initialise();
      expect($componentButtonText.innerText).toBe(buttonCloseText);
    });

    test("By default is opened", async () => {
      ShowHideClick.initialise();
      expect($componentButton).toHaveClass(isOpenClassName);
      expect($componentContent).toHaveClass(isOpenClassName);
      const { height } = $componentContent.getBoundingClientRect();
      expect(height).toBeGreaterThan(0);
    });

    test("When target button clicked, content is closed", (done) => {
      ShowHideClick.initialise();
      $componentButton.click();
      setTimeout(() => {
        expect($componentButton).not.toHaveClass(isOpenClassName);
        expect($componentContent).not.toHaveClass(isOpenClassName);
        expect($componentButtonText.innerText).toBe(buttonOpenText);
        const { height } = $componentContent.getBoundingClientRect();
        expect(height).toEqual(0);
        done();
      }, animationTime * 2);
    });
  });
});
