import "@testing-library/jest-dom";
import axios from "axios";
import { CascadingSelect } from "./index.js";

("use strict");

jest.mock("axios", () => jest.fn(() => Promise.resolve({ data: "data" })));

describe("Test CascadingSelect UI behaviour", () => {
  describe("CascadingSelect default state", () => {
    let $parentSelect = null;
    let $childSelect = null;
    let $unrelatedChildSelect = null;
    let placeholderOptionText = "Please select...";

    const generateEmptyOption = () => {
      const $blankOption = document.createElement("option");
      $blankOption.value = "";
      $blankOption.innerText = placeholderOptionText;
      return $blankOption;
    };

    beforeEach(() => {
      document.body.innerHTML = `
        <div data-xform-cascading-select-scope="true">
          <select 
            data-xform="cascading-select" 
            data-xform-cascading-select-child-select-id="childSelect"
          >
            <option value="1">Category 1</option>
            <option value="2">Category 2</option>
            <option value="3">Category 3</option>
          </select>
          <select
            data-xform="cascading-select"
            data-xform-cascading-select-select-id="childSelect"
          >
            <option value="1a" data-xform-cascading-select-parent-value="1">Sub Category 1 a</option>
            <option value="1b" data-xform-cascading-select-parent-value="1">Sub Category 1 b</option>
            <option value="2a" data-xform-cascading-select-parent-value="2">Sub Category 2 a</option>
            <option value="2b" data-xform-cascading-select-parent-value="2">Sub Category 2 b</option>
            <option value="2c" data-xform-cascading-select-parent-value="2">Sub Category 2 c</option>
            <option value="3a" data-xform-cascading-select-parent-value="3">Sub Category 3 a</option>
            <option value="3b" data-xform-cascading-select-parent-value="3">Sub Category 3 b</option>
          </select>
        </div>
        <div data-xform-cascading-select-scope="true">
          <select
            data-xform="cascading-select"
            data-xform-cascading-select-select-id="childSelect"
          >
            <option value="1a" data-xform-cascading-select-parent-value="1">Sub Category 1 a</option>
            <option value="1b" data-xform-cascading-select-parent-value="1">Sub Category 1 b</option>
            <option value="2a" data-xform-cascading-select-parent-value="2">Sub Category 2 a</option>
            <option value="2b" data-xform-cascading-select-parent-value="2">Sub Category 2 b</option>
            <option value="2c" data-xform-cascading-select-parent-value="2">Sub Category 2 c</option>
            <option value="3a" data-xform-cascading-select-parent-value="3">Sub Category 3 a</option>
            <option value="3b" data-xform-cascading-select-parent-value="3">Sub Category 3 b</option>
          </select>
        </div>
      `;

      const $allCascadingSelect = document.querySelectorAll('[data-xform="cascading-select"]');
      $parentSelect = $allCascadingSelect[0];
      $childSelect = $allCascadingSelect[1];
      $unrelatedChildSelect = $allCascadingSelect[2];
    });

    test("Parent select able to filter target child select based on scope", () => {
      const filterChildSelectOptionsSpy = jest.spyOn(
        CascadingSelect.prototype,
        "filterChildSelectOptions"
      );
      CascadingSelect.initialise();
      $parentSelect.value = "2";
      $parentSelect.dispatchEvent(new Event("change"));
      expect(filterChildSelectOptionsSpy).toBeCalled();
      expect($childSelect.options.length).toBe(3);
      expect($unrelatedChildSelect.options.length).toBe(7);
    });

    test("If child select has placeholder, after filtered, the placeholder should be the first option", () => {
      $childSelect.insertAdjacentElement("afterbegin", generateEmptyOption());
      CascadingSelect.initialise();
      $parentSelect.value = "2";
      $parentSelect.dispatchEvent(new Event("change"));
      expect($childSelect.options.length).toBe(4);
      expect($childSelect.options[0].innerText).toBe(placeholderOptionText);
    });
  });

  describe("CascadingSelect with API call", () => {
    let $parentSelect = null;
    let $childSelect = null;
    const parentApiPath = "/api/cascading-select";
    const parentApiPathResult = [
      { id: 1, text: "Option 1" },
      { id: 2, text: "Option 2" },
      { id: 3, text: "Option 3" },
      { id: 4, text: "Option 4" },
      { id: 5, text: "Option 5" }
    ];
    const childApiPath = "/api/cascading-select/";

    beforeEach(() => {
      document.body.innerHTML = `
        <div data-xform-cascading-select-scope="true">
          <select 
            data-xform="cascading-select" 
            data-xform-cascading-select-child-select-id="childSelect"
            data-xform-cascading-select-options-api-path="${parentApiPath}"
          ></select>
          <select
            data-xform="cascading-select"
            data-xform-cascading-select-select-id="childSelect"
            data-xform-cascading-select-options-partial-api-path="${childApiPath}"
          >
          </select>
        </div>
      `;

      const $allCascadingSelect = document.querySelectorAll('[data-xform="cascading-select"]');
      $parentSelect = $allCascadingSelect[0];
      $childSelect = $allCascadingSelect[1];
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("Parent select with `data-xform-cascading-select-options-api-path` should call `getOptionsWithApi()` once", async () => {
      const getOptionsWithApiSpy = jest.spyOn(CascadingSelect.prototype, "getOptionsWithApi");
      CascadingSelect.initialise();
      expect(getOptionsWithApiSpy).toHaveBeenCalledTimes(1);
      expect(getOptionsWithApiSpy).toHaveBeenCalledWith(parentApiPath);
      expect(axios).toHaveBeenCalledWith({
        url: parentApiPath,
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        }
      });
      expect(axios).toHaveBeenCalledTimes(1);
    });

    test("Child select should call `getOptionsWithApi()` once when `ParentOptionLoaded` event triggered", () => {
      const targetParentValue = "2";
      const customEvent = new CustomEvent(CascadingSelect.ParentOptionLoadedEventName, {
        detail: {
          targetSelect: $childSelect,
          parentValue: targetParentValue,
          apiPath: `${childApiPath}${targetParentValue}`
        }
      });
      const getOptionsWithApiSpy = jest.spyOn(CascadingSelect.prototype, "getOptionsWithApi");

      CascadingSelect.initialise();

      document.dispatchEvent(customEvent);

      expect(getOptionsWithApiSpy).toHaveBeenLastCalledWith(`${childApiPath}${targetParentValue}`);
      expect(getOptionsWithApiSpy).toHaveBeenCalledTimes(2);

      expect(axios).toHaveBeenCalledWith({
        url: `${childApiPath}${targetParentValue}`,
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        }
      });
      expect(axios).toHaveBeenCalled();
    });

    test("Child select should not trigger API when xformCascadingSelectUseDataStore is true and apiDataStore contain existing data", (done) => {
      const targetParentValue = "1";
      const customEvent = new CustomEvent(CascadingSelect.ParentOptionLoadedEventName, {
        detail: {
          targetSelect: $childSelect,
          parentValue: targetParentValue,
          apiPath: `${childApiPath}${targetParentValue}`
        }
      });

      axios.mockResolvedValue({
        data: { optionList: parentApiPathResult }
      });
      $childSelect.dataset.xformCascadingSelectUseDataStore = "true";

      CascadingSelect.initialise();

      setTimeout(() => {
        document.dispatchEvent(customEvent);
        expect(axios).toHaveBeenCalledTimes(2);
        done();
      }, 500);
    });

    test("CascadingSelect replaceSelectOptions() able to populate options with API response data", () => {
      CascadingSelect.replaceSelectOptions(parentApiPathResult, $parentSelect);
      expect($parentSelect.options.length).toBe(parentApiPathResult.length);
    });
  });
});
