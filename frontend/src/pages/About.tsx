const About = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl text-center">
                <h1 className="text-4xl font-extrabold text-teal-600 mb-4">About</h1>
                <p className="text-lg text-gray-700 mb-4">
                    This project solves <span className="font-semibold">NYT mini games</span> and <span className="font-semibold">GamePigeon games</span> using AI!
                </p>
                <p className="text-lg text-gray-700">
                    Click the links above to try it out and explore the solutions.
                </p>
            </div>
        </div>
    );
};

export default About;