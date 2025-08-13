from utils.profiling import start_profiling, stop_profiling

ENABLE_PROFILING = False

def run(func, *args, **kwargs):
    """
    Runs the given function with the provided arguments, profiling its execution.

    Parameters:
        func (callable): The function to run.
        *args: Positional arguments to pass to the function.
        **kwargs: Keyword arguments to pass to the function.
    """
    if not ENABLE_PROFILING:
        return func(*args, **kwargs)  # Run the function without profiling
    
    profiler = start_profiling()
    result = func(*args, **kwargs)  # Run the function with the provided arguments
    profiling_output = stop_profiling(profiler)
    print(f"Profiling output for {func.__module__} - {func.__name__}")
    print(profiling_output)
    return result