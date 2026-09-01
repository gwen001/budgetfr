import BulletinUpload from "./BulletinUpload";

export default function BulletinView() {
    return (
        <div className="p-0">
             <header className="mb-6">
                <h2 className="text-center lg:text-left text-3xl font-semibold mb-4">
                    Bulletin
                </h2>
            </header>
            <p className="mb-4 text-gray-700">
                Importez un bulletin (format PDF) pour analyse automatique.
            </p>

            <BulletinUpload />
        </div>
    );
}
