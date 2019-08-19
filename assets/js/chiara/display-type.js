import _ from 'lodash';

const PLUGIN_KEY = {
    CAMEL: 'displayType',
    SNAKE: 'display-type',
};

function prependHash(id) {
    if (id && id.indexOf('#') === 0) {
        return id;
    }

    return `#${id}`;
}

function optionsFromData($element) {
    return {
        inputName: $element.data(`${PLUGIN_KEY.CAMEL}InputName`),
        prefixClassName: $element.data(`${PLUGIN_KEY.CAMEL}PrefixClassName`),
    };
}

export class DisplayType {
    constructor($form, $target, {
        inputName = 'display-type',
        prefixClassName = 'display-type-',
    } = {}) {
        this.inputName = inputName;
        this.prefixClassName = prefixClassName;
        this.$form = $form;
        this.$target = $target;

        this.onInputChange = this.onInputChange.bind(this);

        this.update($(`input[name=${this.inputName}]:checked`, this.$form).val());

        this.bindEvents();
    }

    update(value) {
        this.$target.each((i, el) => {
            for (let j = 0; j < el.classList.length; j++) {
                const className = el.classList.item(j);
                if (className.indexOf(this.prefixClassName) === 0) {
                    this.$target.removeClass(className);
                }
            }
        });
        this.$target.addClass(`${this.prefixClassName}${value}`);
    }

    onInputChange(event) {
        this.update($(event.target).val());
    }

    bindEvents() {
        this.$form.on('change', `input[name=${this.inputName}]`, this.onInputChange);
    }

    unbindEvents() {
        this.$form.off('change', `input[name=${this.inputName}]`, this.onInputChange);
    }
}

export default function displayTypeFactory(selector = `[data-${PLUGIN_KEY.SNAKE}]`, overrideOptions = {}) {
    const $forms = $(selector, overrideOptions.$context);

    return $forms.map((index, form) => {
        const $form = $(form);
        const instanceKey = `${PLUGIN_KEY.CAMEL}Instance`;
        const cachedInstance = $form.data(instanceKey);

        if (cachedInstance instanceof DisplayType) {
            return cachedInstance;
        }

        const targetId = prependHash($form.data(PLUGIN_KEY.CAMEL) ||
            $form.data(`${PLUGIN_KEY.CAMEL}Target`) ||
            $form.attr('href'));
        const options = _.extend(optionsFromData($form), overrideOptions);
        const instance = new DisplayType($form, $(targetId), options);

        $form.data(instanceKey, instance);

        return instance;
    }).toArray();
}
