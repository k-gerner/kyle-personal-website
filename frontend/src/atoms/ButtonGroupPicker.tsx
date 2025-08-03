const defaultButtonStyle = "py-2 px-4 inline-flex items-center gap-x-2 first:rounded-s-lg first:ms-0 last:rounded-e-lg border border-gray-200 hover:bg-teal text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-teal hover:border-teal focus:text-white focus:bg-dark-teal focus:border-teal active:border-dark-teal active:text-white active:bg-dark-teal";


export interface ButtonGroupPickerProps<T extends string | number> {
    options: T[];
    label?: string;
    selectedValue: T;
    setValue: (value: T) => void;
}

export const ButtonGroupPicker = <T extends string | number>({
    options,
    label,
    selectedValue,
    setValue
}: ButtonGroupPickerProps<T>) => {
    return (
        <div className="flex flex-col gap-2 justify-center items-center">
            <div>
                {options.map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={`${defaultButtonStyle} ${selectedValue === value
                            ? 'bg-dark-teal text-white'
                            : 'bg-white text-gray-800'}
                        `}
                        onClick={() => setValue(value)}
                    >
                        {value}
                    </button>
                ))}
            </div>
            <span className="text-sm text-slate-600">{label}</span>
        </div>
    );
}