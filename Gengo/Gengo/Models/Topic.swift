import Foundation

struct Topic: Identifiable, Codable {
    let id: UUID
    let jaPrompt: String         // 日本語お題
    let enHint: String           // 使えるフレーズのヒント
    let targetExpression: String // 目標とする品詞・表現カテゴリ
    let templates: [String]      // 穴埋めテンプレート（初心者向け）
}

// MARK: - Topic Bank

extension Topic {
    /// 日付をシードに使い、同じ日は同じお題を返す（重複管理）
    static func forToday() -> Topic {
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
        let index = (dayOfYear - 1) % bank.count
        return bank[index]
    }

    static let bank: [Topic] = [
        Topic(
            id: UUID(uuidString: "00000001-0000-0000-0000-000000000001")!,
            jaPrompt: "今日ほっとした瞬間は？",
            enHint: "I finally... / What a relief... / I felt relieved when...",
            targetExpression: "感情形容詞・イディオム",
            templates: [
                "I felt relieved when ___.",
                "What a relief! I finally ___.",
                "I was so glad that ___."
            ]
        ),
        Topic(
            id: UUID(uuidString: "00000001-0000-0000-0000-000000000002")!,
            jaPrompt: "最近やめたこと・始めたことは？",
            enHint: "I've been trying to... / I gave up... / I started...",
            targetExpression: "動詞・継続表現",
            templates: [
                "I recently started ___ing.",
                "I gave up ___ because ___.",
                "I've been trying to ___ lately."
            ]
        ),
        Topic(
            id: UUID(uuidString: "00000001-0000-0000-0000-000000000003")!,
            jaPrompt: "今日誰かにしてあげたことは？",
            enHint: "I quietly... / She seemed really... / I helped...",
            targetExpression: "動詞・副詞",
            templates: [
                "I ___ for someone today.",
                "I quietly helped ___ with ___.",
                "I tried to ___ for ___."
            ]
        ),
        Topic(
            id: UUID(uuidString: "00000001-0000-0000-0000-000000000004")!,
            jaPrompt: "今いる場所を一言で表すと？",
            enHint: "This place feels... / It's like... / I'd describe it as...",
            targetExpression: "形容詞・比喩・イディオム",
            templates: [
                "This place is ___.",
                "I'd describe it as ___ because ___.",
                "It feels like ___ here."
            ]
        ),
        Topic(
            id: UUID(uuidString: "00000001-0000-0000-0000-000000000005")!,
            jaPrompt: "今週一番驚いたことは？",
            enHint: "I was blown away by... / I couldn't believe... / It surprised me that...",
            targetExpression: "感嘆表現・過去形",
            templates: [
                "I was surprised that ___.",
                "I couldn't believe ___ happened.",
                "I was blown away by ___."
            ]
        ),
        Topic(
            id: UUID(uuidString: "00000001-0000-0000-0000-000000000006")!,
            jaPrompt: "今日一番楽しかった瞬間は？",
            enHint: "I had a blast... / I really enjoyed... / It was such fun when...",
            targetExpression: "感情動詞・副詞",
            templates: [
                "I really enjoyed ___ today.",
                "I had so much fun ___ing.",
                "It made me happy when ___."
            ]
        ),
        Topic(
            id: UUID(uuidString: "00000001-0000-0000-0000-000000000007")!,
            jaPrompt: "最近ハマっていることは？",
            enHint: "I'm obsessed with... / I can't stop ___ing... / I've been into...",
            targetExpression: "動詞・進行形",
            templates: [
                "I've been really into ___ lately.",
                "I can't stop ___ing these days.",
                "I'm obsessed with ___ right now."
            ]
        ),
        Topic(
            id: UUID(uuidString: "00000001-0000-0000-0000-000000000008")!,
            jaPrompt: "もし明日が休みだったら何をする？",
            enHint: "If I had... / I would definitely... / I'd spend the day...",
            targetExpression: "仮定法・動詞",
            templates: [
                "If I had a day off, I would ___.",
                "I'd definitely spend time ___ing.",
                "I would love to ___ if I could."
            ]
        ),
        Topic(
            id: UUID(uuidString: "00000001-0000-0000-0000-000000000009")!,
            jaPrompt: "今日イライラしたこと・困ったことは？",
            enHint: "I was so frustrated when... / It drove me crazy... / I struggled with...",
            targetExpression: "感情形容詞・強調副詞",
            templates: [
                "I was really frustrated when ___.",
                "It drove me crazy that ___.",
                "I struggled with ___ today."
            ]
        ),
        Topic(
            id: UUID(uuidString: "00000001-0000-0000-0000-000000000010")!,
            jaPrompt: "今日誰かに言われて嬉しかった言葉は？",
            enHint: "Someone told me... / It meant a lot when... / I was touched when...",
            targetExpression: "引用・感情表現",
            templates: [
                "Someone told me ___ today and it made me happy.",
                "It really meant a lot when ___ said ___.",
                "I was so touched when ___."
            ]
        )
    ]
}
