/**
 * @jest-environment jsdom
 */

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
  });

  test("Able to set given text to target button", () => {
    ShowHideClick.initialise();
    expect($componentButtonText.innerText).toBe(buttonOpenText);
  });

  test("By default is closed", () => {
    ShowHideClick.initialise();
    expect($componentButton).not.toHaveClass(isOpenClassName);
    expect($componentContent).not.toHaveClass(isOpenClassName);
  });

  test("When target button clicked, content is opened", (done) => {
    ShowHideClick.initialise();
    $componentButton.click();
    setTimeout(() => {
      expect($componentButton).toHaveClass(isOpenClassName);
      expect($componentContent).toHaveClass(isOpenClassName);
      expect($componentButtonText.innerText).toBe(buttonCloseText);
      done();
    }, animationTime * 2);
  });

  describe('ShowHideClick with `data-xform-show-hide-click-is-default-open="true"`', () => {
    beforeEach(() => {
      $componentContent.dataset.xformShowHideClickIsDefaultOpen = "true";
    });

    test("By default is opened", async () => {
      ShowHideClick.initialise();
      expect($componentButton).toHaveClass(isOpenClassName);
      expect($componentContent).toHaveClass(isOpenClassName);
    });

    test("When target button clicked, content is closed", (done) => {
      ShowHideClick.initialise();
      $componentButton.click();
      setTimeout(() => {
        expect($componentButton).not.toHaveClass(isOpenClassName);
        expect($componentContent).not.toHaveClass(isOpenClassName);
        expect($componentButtonText.innerText).toBe(buttonOpenText);
        done();
      }, animationTime * 2);
    });
  });
});
