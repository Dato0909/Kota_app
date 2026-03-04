import SwiftUI
import SwiftData

@main
struct GengoApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .modelContainer(for: Post.self)
        }
    }
}
