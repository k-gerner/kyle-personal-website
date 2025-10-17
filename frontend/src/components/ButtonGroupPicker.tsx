import { twMerge } from 'tailwind-merge';

const defaultButtonStyle = [
    "py-2",
    "px-4",
    "inline-flex",
    "items-center",
    "gap-x-2",
    "first:rounded-s-lg",
    "first:ms-0",
    "last:rounded-e-lg",
    "border",
    "border-brd-muted",
    "hover:bg-primary-base",
    "text-center",
    "text-sm",
    "transition-all",
    "shadow-sm",
    "hover:shadow-lg",
    "text-text-muted",
    // hover state styles
    "hover:text-text-contrast",
    "hover:bg-primary-base",
    "hover:border-primary-base",
    // focus state styles
    "focus:text-text-contrast",
    "focus:bg-primary-highlight",
    "focus:border-primary-base",
    // active state styles
    "active:border-primary-highlight",
    "active:text-text-contrast",
    "active:bg-primary-highlight",
    // disabled state styles
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "disabled:shadow-none",
].join(" ");

export type ButtonGroupPickerOption<T extends string | number> = { label: string; value: T };

export type ButtonGroupPickerProps<T extends string | number> =
    | {
        options: T[]; // `options` is set
        optionsWithLabels?: never; // `optionsWithLabels` must not be set
        label?: string;
        selectedValue: T;
        setValue: (value: T) => void;
        disabled?: boolean;
        showSelectedOnDisabled?: boolean; // if true, the selected button will be highlighted even when disabled
    }
    | {
        options?: never; // `options` must not be set
        optionsWithLabels: ButtonGroupPickerOption<T>[]; // `optionsWithLabels` is set
        label?: string;
        selectedValue: T;
        setValue: (value: T) => void;
        disabled?: boolean;
        showSelectedOnDisabled?: boolean; // if true, the selected button will be highlighted even when disabled
    };

export const ButtonGroupPicker = <T extends string | number>({
    options,
    optionsWithLabels,
    label,
    selectedValue,
    setValue,
    disabled = false,
    showSelectedOnDisabled = false,
}: ButtonGroupPickerProps<T>) => {
    return (
        <div className="flex flex-col gap-2 justify-center items-center">
            <div>
                {options
                    ?
                    options.map((option) => {
                        const dynamicClasses = `${selectedValue === option
                            ? 'bg-primary-highlight text-text-contrast'
                            : 'bg-background-base text-text-muted'}
                                ${showSelectedOnDisabled
                                ? ''
                                : 'disabled:bg-background-muted disabled:text-text-dull'
                            }`
                        return (
                            <button
                                key={option}
                                type="button"
                                className={`${twMerge(defaultButtonStyle, dynamicClasses)}
                            `}
                                onClick={() => setValue(option)}
                                disabled={disabled}
                            >
                                {option}
                            </button>
                        )
                    })
                    :
                    optionsWithLabels?.map(({ value, label }) => {
                        const dynamicClasses = `${selectedValue === value
                            ? 'bg-primary-highlight text-text-contrast'
                            : 'bg-background-base text-text-muted'}
                                ${showSelectedOnDisabled
                                ? ''
                                : 'disabled:bg-background-muted disabled:text-text-dull'
                            }`
                        return (
                            <button
                                key={value}
                                type="button"
                                className={`${twMerge(defaultButtonStyle, dynamicClasses)}`}
                                onClick={() => setValue(value)}
                                disabled={disabled}
                            >
                                {label}
                            </button>
                        )
                    })}
            </div>
            <span className="text-sm text-text-muted">{label}</span>
        </div>
    );
};
