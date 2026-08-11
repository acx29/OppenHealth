/** Full-screen wait state for route guards and initial data fetches — replaces the blank white flash. */
export default function LoadingScreen() {
    return (
        <div className="loading-screen" role="status" aria-label="Loading">
            <div className="loading-spin" />
        </div>
    );
}
