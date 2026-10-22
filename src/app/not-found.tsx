import Link from "next/link";

export default function NotFound() {
    return (
        <div className="card stack center">
            <h1>Page not found</h1>
            <Link className="btn" href="/">
                Go to booking
            </Link>
        </div>
    );
}
