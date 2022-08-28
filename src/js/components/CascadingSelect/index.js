import axios from "axios";

const CASCADING_SELECT_SELECTOR = "[data-xform='cascading-select']";

class CascadingSelect {
  $selectElement = null;
  $childSelectElement = null;
  $targetContainer = null;
  apiDataStore = {};
  selectConfigOptions = {};
  selectedValue = null;
  childSelectId = "";
  childSelectPartialApiPath = false;
  currentChildSelectOptionsData = [];

  static ParentOptionLoadedEventName = "ParentOptionLoaded";

  static initialise(options = {}) {
    let $selectElements = [];
    if (options.selector) {
      if (options.selector instanceof HTMLSelectElement) {
        $selectElements = [options.selector];
      } else if (typeof options.selector === "string") {
        $selectElements = document.querySelectorAll(options.selector);
      }
    } else {
      $selectElements = document.querySelectorAll(CASCADING_SELECT_SELECTOR);
    }

    [...$selectElements].forEach(($selectElement) => {
      /* eslint-disable-next-line no-unused-vars */
      const cascadingSelect = new CascadingSelect($selectElement, options);
    });
  }

  constructor($selectElement, options) {
    this.$selectElement = $selectElement;
    this.selectConfigOptions = options;
    this.$targetContainer =
      this.$selectElement.closest("[data-xform-cascading-select-scope='true']") || document;

    const { selectedIndex, options: $selectOptions } = this.$selectElement;
    if ($selectOptions[selectedIndex]) {
      this.selectedValue = $selectOptions[selectedIndex].value;
    }

    const { xformCascadingSelectOptionsApiPath, xformCascadingSelectOptionsPartialApiPath } =
      this.$selectElement.dataset;
    if (xformCascadingSelectOptionsApiPath) {
      // NOTE: Get self options data from API
      this.getOptionsWithApi(xformCascadingSelectOptionsApiPath);
      return;
    }

    document.addEventListener(CascadingSelect.ParentOptionLoadedEventName, (e) => {
      const { apiPath, targetSelect } = e.detail;
      if (targetSelect === this.$selectElement) {
        this.getOptionsWithApi(apiPath);
      }
    });

    if (!xformCascadingSelectOptionsPartialApiPath) {
      /* NOTE:
       * if element has partial API,
       * it needs to wait for parent select value first
       */
      this.checkAndStoreChildSelectOptionsData();
    }
  }

  bindOnChangeBehaviour() {
    const changeEventHandler = () => {
      if (this.childSelectPartialApiPath) {
        this.triggerEvent();
      } else {
        this.filterChildSelectOptions();
      }
    };

    this.$selectElement.addEventListener("change", (e) => {
      this.selectedValue = e.target.value;
      changeEventHandler();
    });

    this.selectedValue = this.$selectElement.value;
    changeEventHandler();
  }

  checkAndStoreChildSelectOptionsData() {
    const { xformCascadingSelectChildSelectId } = this.$selectElement.dataset;
    if (xformCascadingSelectChildSelectId) {
      this.childSelectId = xformCascadingSelectChildSelectId;
      this.$childSelectElement = this.$targetContainer.querySelector(
        `[data-xform-cascading-select-select-id="${xformCascadingSelectChildSelectId}"]`
      );
      if (this.$childSelectElement) {
        const { xformCascadingSelectOptionsPartialApiPath } = this.$childSelectElement.dataset;
        if (xformCascadingSelectOptionsPartialApiPath) {
          this.childSelectPartialApiPath = xformCascadingSelectOptionsPartialApiPath;
          this.bindOnChangeBehaviour();
        } else {
          const $childSelectOptions = this.$childSelectElement.querySelectorAll("option");
          if ($childSelectOptions) {
            this.childSelectOptionsData = [...$childSelectOptions].map(($childSelectOption) => {
              const { xformCascadingSelectParentValue } = $childSelectOption.dataset;
              return {
                text: $childSelectOption.innerText,
                value: $childSelectOption.value,
                selected: !!$childSelectOption.selected,
                parentValue: xformCascadingSelectParentValue
              };
            });
            this.bindOnChangeBehaviour();
          }
        }
      }
    }
  }

  filterChildSelectOptions() {
    let filteredOptions = [];
    let shouldSetDisable = false;

    const hasEmptyOption = CascadingSelect.checkHasPlaceholderOption(this.childSelectOptionsData);
    const { xformCascadingSelectDisableIfEmpty, xformCascadingSelectNoFilterIfParentEmpty } =
      this.$childSelectElement.dataset;

    if (this.selectedValue) {
      filteredOptions = this.childSelectOptionsData.filter(
        (optionObj) => optionObj.parentValue === this.selectedValue
      );
    } else {
      // NOTE: no selectedValue or selectedValue is blank string
      /* eslint-disable-next-line no-lonely-if */
      if (xformCascadingSelectNoFilterIfParentEmpty === "true") {
        filteredOptions = this.childSelectOptionsData;
      }
    }

    if (filteredOptions.length === 0 && xformCascadingSelectDisableIfEmpty === "true") {
      shouldSetDisable = true;
    }

    if (hasEmptyOption) {
      filteredOptions = [this.childSelectOptionsData[0], ...filteredOptions];
    }

    this.$childSelectElement.disabled = shouldSetDisable;
    CascadingSelect.replaceSelectOptions(filteredOptions, this.$childSelectElement);
    this.$childSelectElement.dispatchEvent(new Event("change"));
  }

  static checkHasPlaceholderOption(selectOptionsData) {
    const firstOption = selectOptionsData[0];
    return firstOption && firstOption.value === "";
  }

  getOptionsWithApi(apiPath, $targetSelect = null) {
    const $currentSelect = $targetSelect || this.$selectElement;
    const mapDataToSelectArray = (responseData) => {
      return responseData.map((item) => ({
        value: item.id,
        text: item.text,
        selected: item.selected === true
      }));
    };
    const setupSelectOptions = (selectOptionsData) => {
      CascadingSelect.replaceSelectOptions(selectOptionsData, $currentSelect);
    };

    const { xformCascadingSelectUseDataStore } = $currentSelect.dataset;
    if (
      xformCascadingSelectUseDataStore === "true" &&
      this.apiDataStore[apiPath] &&
      this.apiDataStore[apiPath].length > 0
    ) {
      setupSelectOptions(this.apiDataStore[apiPath]);
      return;
    }

    axios({
      url: apiPath,
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    })
      .then((response) => {
        const { data } = response;
        this.apiDataStore[apiPath] = mapDataToSelectArray(data.optionList);
        setupSelectOptions(this.apiDataStore[apiPath]);
        this.checkAndStoreChildSelectOptionsData();
      })
      .catch(() => {
        // NOTE: if error, silent fail and do not update any data.
      });
  }

  static replaceSelectOptions(filteredOptions, $targetSelect) {
    while ($targetSelect.options.length > 0) {
      $targetSelect.remove(0);
    }

    filteredOptions.forEach((optionData) => {
      const $newOption = document.createElement("option");
      $newOption.innerText = optionData.text;
      $newOption.value = optionData.value;
      $newOption.selected = optionData.selected;
      $targetSelect.appendChild($newOption);
    });
  }

  triggerEvent() {
    const customEvent = new CustomEvent(CascadingSelect.ParentOptionLoadedEventName, {
      detail: {
        targetSelect: this.$childSelectElement,
        parentValue: this.selectedValue,
        apiPath: `${this.childSelectPartialApiPath}${this.selectedValue}`
      }
    });
    document.dispatchEvent(customEvent);
  }
}

export { CascadingSelect };
