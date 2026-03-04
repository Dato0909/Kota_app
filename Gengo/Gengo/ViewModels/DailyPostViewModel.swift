import SwiftUI
import SwiftData
import PhotosUI

@Observable
final class DailyPostViewModel {

    // MARK: - Post Input State
    var postText: String = ""
    var selectedPhotoItem: PhotosPickerItem?
    var selectedImage: UIImage?
    var isSubmitting: Bool = false

    // MARK: - Today's Topic
    let todaysTopic: Topic = Topic.forToday()

    // MARK: - Computed Properties

    var canSubmit: Bool {
        !postText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isSubmitting
    }

    // MARK: - Actions

    func applyTemplate(_ template: String) {
        postText = template
    }

    func loadImage() async {
        guard let item = selectedPhotoItem else { return }
        guard let data = try? await item.loadTransferable(type: Data.self),
              let image = UIImage(data: data) else { return }
        await MainActor.run {
            self.selectedImage = image
        }
    }

    func removePhoto() {
        selectedImage = nil
        selectedPhotoItem = nil
    }

    @MainActor
    func submit(context: ModelContext) {
        guard canSubmit else { return }
        isSubmitting = true

        let photoData = selectedImage?.jpegData(compressionQuality: 0.8)
        let post = Post(
            topicId: todaysTopic.id,
            topicPrompt: todaysTopic.jaPrompt,
            text: postText.trimmingCharacters(in: .whitespacesAndNewlines),
            photoData: photoData
        )
        context.insert(post)

        reset()
        isSubmitting = false
    }

    // MARK: - Private

    private func reset() {
        postText = ""
        selectedImage = nil
        selectedPhotoItem = nil
    }
}
