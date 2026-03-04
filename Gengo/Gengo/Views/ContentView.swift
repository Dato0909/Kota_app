import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("ホーム", systemImage: "house.fill")
                }
            // 単語帳・フィード・プロフィールは今後追加
        }
        .background(Color(.systemBackground))
    }
}

#Preview {
    ContentView()
        .modelContainer(for: Post.self, inMemory: true)
}
