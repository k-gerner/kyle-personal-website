import cProfile
import pstats
import io

def start_profiling():
    """Starts profiling the code."""
    profiler = cProfile.Profile()
    profiler.enable()
    return profiler

def stop_profiling(profiler):
    """Stops profiling and returns the profiling stats."""
    profiler.disable()
    s = io.StringIO()
    ps = pstats.Stats(profiler, stream=s).strip_dirs().sort_stats("time")
    ps.print_stats(10)  # Print the top 10 functions by time
    return s.getvalue()  # Returns the profiling results as a string