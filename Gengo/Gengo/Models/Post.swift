import Foundation
import SwiftData

@Model
final class Post {
    var id: UUID
    var topicId: UUID
    var topicPrompt: String
    var text: String
    @Attribute(.externalStorage) var photoData: Data?
    var createdAt: Date

    init(topicId: UUID, topicPrompt: String, text: String, photoData: Data? = nil) {
        self.id = UUID()
        self.topicId = topicId
        self.topicPrompt = topicPrompt
        self.text = text
        self.photoData = photoData
        self.createdAt = Date()
    }

    var isFromToday: Bool {
        Calendar.current.isDateInToday(createdAt)
    }
}
