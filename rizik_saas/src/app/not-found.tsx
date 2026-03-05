import Link from "next/link";
export const runtime = "edge";

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-3xl font-bold text-[#031E49] mb-4">404 - Page Not Found</h2>
            <p className="text-[#0A2D6C]/70 mb-8 max-w-md mx-auto">
                The Rizik Ecosystem page you are looking for does not exist or has been moved.
            </p>
            <Link
                href="/"
                className="px-6 py-3 bg-[#031E49] text-white font-semibold rounded-lg hover:bg-[#0A2D6C] transition-colors"
            >
                Return Home
            </Link>
        </div>
    );
}
