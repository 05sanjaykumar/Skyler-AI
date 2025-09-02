export default function VideoDemo(){
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Video Demonstration</h1>
            <p className="mb-4">
                Watch our video tutorial to learn how to use Skyler Inbox effectively.
            </p>
            <div className="aspect-w-16 aspect-h-9">
                <iframe
                    src="https://www.youtube.com/embed/your-video-id"
                    title="Video Tutorial"
                    className="w-full h-full"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}