import SwiftUI

struct TopicCardView: View {
    let topic: Topic

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {

            // Header
            HStack {
                Label("今日のお題", systemImage: "text.bubble.fill")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundStyle(.white.opacity(0.85))
                Spacer()
                Text(topic.targetExpression)
                    .font(.caption2)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(.white.opacity(0.2))
                    .clipShape(Capsule())
                    .foregroundStyle(.white)
            }

            // Prompt
            Text(topic.jaPrompt)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundStyle(.white)
                .fixedSize(horizontal: false, vertical: true)

            Divider()
                .overlay(.white.opacity(0.3))

            // Hint
            VStack(alignment: .leading, spacing: 3) {
                Text("使えるフレーズ")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.7))
                Text(topic.enHint)
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.95))
                    .lineSpacing(2)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(12)
        .background(
            LinearGradient(
                colors: [Color.accentColor, Color.accentColor.opacity(0.75)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    TopicCardView(topic: Topic.bank[0])
        .padding()
}
