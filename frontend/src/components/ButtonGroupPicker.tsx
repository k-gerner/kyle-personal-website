const defaultButtonStyle = "py-2 px-4 inline-flex items-center gap-x-2 first:rounded-s-lg first:ms-0 last:rounded-e-lg border border-gray-200 hover:bg-primary-base text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-text-contrast hover:bg-primary-base hover:border-primary-base focus:text-text-contrast focus:bg-primary-highlight focus:border-primary-base active:border-primary-highlight active:text-text-contrast active:bg-primary-highlight";

export type ButtonGroupPickerOption<T extends string | number> = { label: string; value: T };

export type ButtonGroupPickerProps<T extends string | number> =
    | {
        options: T[]; // `options` is set
        optionsWithLabels?: never; // `optionsWithLabels` must not be set
        label?: string;
        selectedValue: T;
        setValue: (value: T) => void;
    }
    | {
        options?: never; // `options` must not be set
        optionsWithLabels: ButtonGroupPickerOption<T>[]; // `optionsWithLabels` is set
        label?: string;
        selectedValue: T;
        setValue: (value: T) => void;
    };

export const ButtonGroupPicker = <T extends string | number>({
    options,
    optionsWithLabels,
    label,
    selectedValue,
    setValue,
}: ButtonGroupPickerProps<T>) => {
    return (
        <div className="flex flex-col gap-2 justify-center items-center">
            <div>
                {options
                    ?
                    options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className={`${defaultButtonStyle} ${selectedValue === option
                                ? 'bg-primary-highlight text-text-contrast'
                                : 'bg-background-base text-gray-800'}
                            `}
                            onClick={() => setValue(option)}
                        >
                            {option}
                        </button>
                    ))
                    :
                    optionsWithLabels?.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            className={`${defaultButtonStyle} ${selectedValue === value
                                ? 'bg-primary-highlight text-text-contrast'
                                : 'bg-background-base text-gray-800'}
                            `}
                            onClick={() => setValue(value)}
                        >
                            {label}
                        </button>
                    ))}
            </div>
            <span className="text-sm text-slate-600">{label}</span>
        </div>
    );
};
