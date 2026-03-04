import SwiftUI
import SwiftData
import PhotosUI

struct PostView: View {
    @Bindable var viewModel: DailyPostViewModel
    let onSubmit: () -> Void

    @Environment(\.dismiss) private var dismiss
    @FocusState private var isTextFocused: Bool

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    TopicCardView(topic: viewModel.todaysTopic)
                    TemplatePickerSection(
                        templates: viewModel.todaysTopic.templates,
                        onSelect: { viewModel.applyTemplate($0) }
                    )
                    TextInputSection(
                        text: $viewModel.postText,
                        isFocused: $isTextFocused
                    )
                    PhotoSection(
                        selectedItem: $viewModel.selectedPhotoItem,
                        selectedImage: viewModel.selectedImage,
                        onRemove: viewModel.removePhoto
                    )
                    .onChange(of: viewModel.selectedPhotoItem) { _, _ in
                        Task { await viewModel.loadImage() }
                    }
                }
                .padding()
            }
            .navigationTitle("今日の1文")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("投稿する") {
                        onSubmit()
                    }
                    .fontWeight(.semibold)
                    .disabled(!viewModel.canSubmit)
                }
            }
            .onAppear { isTextFocused = true }
        }
    }
}

// MARK: - Template Picker

private struct TemplatePickerSection: View {
    let templates: [String]
    let onSelect: (String) -> Void
    @State private var isExpanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Button {
                withAnimation(.easeInOut(duration: 0.2)) { isExpanded.toggle() }
            } label: {
                HStack {
                    Image(systemName: "lightbulb.fill")
                        .foregroundStyle(.yellow)
                    Text("テンプレートを使う")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Spacer()
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .foregroundStyle(.primary)
            }

            if isExpanded {
                VStack(spacing: 8) {
                    ForEach(templates, id: \.self) { template in
                        Button {
                            onSelect(template)
                            isExpanded = false
                        } label: {
                            Text(template)
                                .font(.subheadline)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(10)
                                .background(Color.accentColor.opacity(0.08))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                .foregroundStyle(.primary)
                        }
                    }
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color.accentColor.opacity(0.25), lineWidth: 1)
        )
    }
}

// MARK: - Text Input

private struct TextInputSection: View {
    @Binding var text: String
    var isFocused: FocusState<Bool>.Binding

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("英文を書こう")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Spacer()
                Text("1〜2文でOK")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            ZStack(alignment: .topLeading) {
                TextEditor(text: $text)
                    .focused(isFocused)
                    .frame(minHeight: 110, maxHeight: 160)
                    .padding(10)
                    .scrollContentBackground(.hidden)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                if text.isEmpty {
                    Text("例：I was blown away by the sunset today.")
                        .foregroundStyle(.tertiary)
                        .font(.body)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 18)
                        .allowsHitTesting(false)
                }
            }
        }
    }
}

// MARK: - Photo Section

private struct PhotoSection: View {
    @Binding var selectedItem: PhotosPickerItem?
    let selectedImage: UIImage?
    let onRemove: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("写真を添付する（任意）")
                .font(.subheadline)
                .fontWeight(.semibold)

            if let image = selectedImage {
                ZStack(alignment: .topTrailing) {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFill()
                        .frame(maxWidth: .infinity)
                        .frame(height: 180)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                    Button(action: onRemove) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title3)
                            .foregroundStyle(.white)
                            .shadow(radius: 2)
                            .padding(8)
                    }
                }
            } else {
                PhotosPicker(selection: $selectedItem, matching: .images) {
                    HStack {
                        Image(systemName: "photo.badge.plus")
                        Text("写真を選ぶ")
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .foregroundStyle(.secondary)
                }
            }
        }
    }
}
