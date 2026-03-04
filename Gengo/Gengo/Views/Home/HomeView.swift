import SwiftUI
import SwiftData

struct HomeView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Post.createdAt, order: .reverse) private var allPosts: [Post]
    @State private var viewModel = DailyPostViewModel()
    @State private var showingPostView = false

    private var todaysPost: Post? {
        allPosts.first(where: { $0.isFromToday })
    }

    private var hasPostedToday: Bool {
        todaysPost != nil
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    TopicCardView(topic: viewModel.todaysTopic)

                    if let post = todaysPost {
                        CompletedCard(post: post)
                    } else {
                        PostPromptCard {
                            showingPostView = true
                        }
                    }

                    if allPosts.count > 1 {
                        PostHistorySection(posts: Array(allPosts.dropFirst()))
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Gengo")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(Color(.systemGroupedBackground), for: .navigationBar)
            .sheet(isPresented: $showingPostView) {
                PostView(viewModel: viewModel) {
                    viewModel.submit(context: modelContext)
                    showingPostView = false
                }
                .presentationDetents([.large])
                .presentationDragIndicator(.hidden)
            }
        }
    }
}

// MARK: - Post Prompt Card

private struct PostPromptCard: View {
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                Image(systemName: "pencil.line")
                    .font(.title2)
                VStack(alignment: .leading, spacing: 2) {
                    Text("今日の1文を書く")
                        .font(.headline)
                    Text("1〜2文でOK。今日できることをやろう")
                        .font(.caption)
                        .opacity(0.85)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .opacity(0.7)
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.accentColor)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }
}

// MARK: - Completed Card

private struct CompletedCard: View {
    let post: Post

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.green)
                Text("今日の投稿が完了しました")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundStyle(.green)
                Spacer()
            }

            if let data = post.photoData, let image = UIImage(data: data) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(maxWidth: .infinity)
                    .frame(height: 140)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }

            Text(post.text)
                .font(.body)
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 10))

            Text("明日のお題をお楽しみに")
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: .center)
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.green.opacity(0.3), lineWidth: 1)
        )
    }
}

// MARK: - Post History

private struct PostHistorySection: View {
    let posts: [Post]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("これまでの投稿")
                .font(.headline)

            ForEach(posts.prefix(10)) { post in
                PostHistoryRow(post: post)
            }
        }
    }
}

private struct PostHistoryRow: View {
    let post: Post

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(post.topicPrompt)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(post.text)
                .font(.subheadline)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}
