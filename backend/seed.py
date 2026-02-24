"""
シードスクリプト: 専門分野 + 元請け企業5社 + 案件20件を作成
使い方: cd backend && source .venv/bin/activate && python seed.py
"""

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.user import User
from app.models.company import Company, Specialty, company_specialties
from app.models.project import Project

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/kensetsu"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------------------------
# 1. 専門分野マスタ
# ---------------------------------------------------------------------------
SPECIALTIES = [
    "塗装",
    "防水",
    "電気工事",
    "空調設備",
    "給排水衛生設備",
    "内装仕上",
    "左官",
    "タイル",
    "鳶・足場",
    "大工",
    "屋根工事",
    "解体",
    "土木",
    "鉄筋",
    "コンクリート",
]

# ---------------------------------------------------------------------------
# 2. 元請け企業 (contractor) 5社
# ---------------------------------------------------------------------------
CONTRACTORS = [
    {
        "email": "tanaka@example.com",
        "password": "password123",
        "company": {
            "name": "株式会社田中建設",
            "description": "創業35年の総合建設会社。マンション大規模修繕を中心に、商業施設・オフィスビルのリニューアル工事を手がけています。年間施工実績200件以上。",
            "address": "東京都新宿区西新宿1-25-1",
            "phone": "03-1234-5678",
            "website": "https://tanaka-kensetsu.example.com",
            "established_year": 1991,
            "employee_count": 85,
            "specialties": ["塗装", "防水", "内装仕上", "鳶・足場"],
        },
    },
    {
        "email": "suzuki@example.com",
        "password": "password123",
        "company": {
            "name": "鈴木電設工業株式会社",
            "description": "電気設備・空調設備のプロフェッショナル。オフィスビル・工場の電気設備新設から改修まで対応。省エネ提案に強み。",
            "address": "大阪府大阪市中央区本町3-5-7",
            "phone": "06-9876-5432",
            "website": "https://suzuki-densetsu.example.com",
            "established_year": 2003,
            "employee_count": 42,
            "specialties": ["電気工事", "空調設備"],
        },
    },
    {
        "email": "yamamoto@example.com",
        "password": "password123",
        "company": {
            "name": "山本ホームテック株式会社",
            "description": "住宅リフォーム・リノベーション専門。キッチン・浴室・トイレなど水回りから外壁塗装まで、住まいのことなら何でもご相談ください。",
            "address": "神奈川県横浜市中区山下町15-3",
            "phone": "045-1111-2222",
            "website": "https://yamamoto-ht.example.com",
            "established_year": 2010,
            "employee_count": 28,
            "specialties": ["塗装", "給排水衛生設備", "内装仕上", "タイル"],
        },
    },
    {
        "email": "sato@example.com",
        "password": "password123",
        "company": {
            "name": "佐藤土木株式会社",
            "description": "道路・橋梁・上下水道などの公共インフラ工事を中心に、土木工事全般を請け負っています。国土交通大臣許可 特定建設業。",
            "address": "愛知県名古屋市中区栄4-16-8",
            "phone": "052-3333-4444",
            "website": "https://sato-doboku.example.com",
            "established_year": 1985,
            "employee_count": 120,
            "specialties": ["土木", "コンクリート", "鉄筋", "解体"],
        },
    },
    {
        "email": "takahashi@example.com",
        "password": "password123",
        "company": {
            "name": "高橋設備工業株式会社",
            "description": "空調・衛生設備の設計施工。ホテル・病院・商業施設の大型設備工事から、住宅の給湯器交換まで幅広く対応。24時間緊急対応可。",
            "address": "福岡県福岡市博多区博多駅前2-19-12",
            "phone": "092-5555-6666",
            "website": "https://takahashi-setsubi.example.com",
            "established_year": 1998,
            "employee_count": 55,
            "specialties": ["空調設備", "給排水衛生設備"],
        },
    },
]

# ---------------------------------------------------------------------------
# 3. 案件 20件
# ---------------------------------------------------------------------------
today = datetime.now(timezone.utc).date()


def dl(days: int) -> str:
    return (today + timedelta(days=days)).isoformat()


PROJECTS = [
    # --- 田中建設 (idx 0) ---
    {
        "contractor_idx": 0,
        "title": "新宿区 マンション大規模修繕工事 外壁塗装",
        "description": "築25年・14階建てRC造マンション(120戸)の大規模修繕工事における外壁塗装を担当していただける業者を募集します。\n\n【工事概要】\n・外壁面積: 約4,800m2\n・仕様: シリコン樹脂塗装(2回塗り)\n・足場は別途手配済み\n\n現場説明会を実施予定。詳細はお問い合わせください。",
        "location": "東京都新宿区",
        "budget_min": 8000000,
        "budget_max": 12000000,
        "deadline": dl(45),
        "specialty": "塗装",
    },
    {
        "contractor_idx": 0,
        "title": "渋谷区 商業ビル屋上防水改修工事",
        "description": "商業ビル(地上8階)の屋上防水改修工事です。既存ウレタン防水の撤去・新規シート防水施工。\n\n・施工面積: 約350m2\n・工期: 着工から3週間程度\n・作業時間: 日中(9:00-17:00)",
        "location": "東京都渋谷区",
        "budget_min": 3000000,
        "budget_max": 4500000,
        "deadline": dl(30),
        "specialty": "防水",
    },
    {
        "contractor_idx": 0,
        "title": "品川区 オフィスビル内装リニューアル",
        "description": "築15年のオフィスビル3フロア(計900m2)の内装リニューアル工事です。\n\n【工事内容】\n・天井: 吸音ボード張り替え\n・壁: クロス張り替え\n・床: タイルカーペット張り替え\n・LED照明への交換(別途電気工事あり)\n\nテナント入居中のため、夜間・週末作業が中心となります。",
        "location": "東京都品川区",
        "budget_min": 15000000,
        "budget_max": 20000000,
        "deadline": dl(60),
        "specialty": "内装仕上",
    },
    {
        "contractor_idx": 0,
        "title": "中野区 集合住宅 足場架設・解体",
        "description": "集合住宅(5階建て・全40戸)の大規模修繕に伴う足場架設および工事完了後の解体をお願いします。\n\n・建物高さ: 約16m\n・足場面積: 約1,200m2\n・くさび式足場\n・メッシュシート設置含む",
        "location": "東京都中野区",
        "budget_min": 2500000,
        "budget_max": 3500000,
        "deadline": dl(20),
        "specialty": "鳶・足場",
    },
    # --- 鈴木電設 (idx 1) ---
    {
        "contractor_idx": 1,
        "title": "大阪市 オフィスビル電気設備改修工事",
        "description": "築20年のオフィスビル(地上10階・延床5,000m2)の電気設備全面改修工事です。\n\n【工事内容】\n・受変電設備更新\n・幹線ケーブル引き替え\n・各階分電盤交換\n・LED照明化\n・非常用発電機更新\n\n電気工事士1種保有者必須。施工管理技士在籍業者優遇。",
        "location": "大阪府大阪市中央区",
        "budget_min": 25000000,
        "budget_max": 35000000,
        "deadline": dl(90),
        "specialty": "電気工事",
    },
    {
        "contractor_idx": 1,
        "title": "堺市 工場空調設備新設工事",
        "description": "食品工場の新築工事における空調設備の施工を担当していただける業者を募集します。\n\n【概要】\n・延床面積: 2,000m2\n・パッケージエアコン 計15台設置\n・ダクト配管工事\n・クリーンルーム対応(一部)\n・自動制御盤設置\n\nHACCP対応経験のある業者を希望。",
        "location": "大阪府堺市",
        "budget_min": 18000000,
        "budget_max": 25000000,
        "deadline": dl(75),
        "specialty": "空調設備",
    },
    {
        "contractor_idx": 1,
        "title": "神戸市 商業施設 弱電設備工事",
        "description": "新規オープン予定の商業施設における弱電設備工事です。\n\n・LAN配線(Cat6A): 約200ポイント\n・監視カメラ設備: 48台\n・自動火災報知設備\n・非常放送設備\n・入退室管理システム\n\n工期: 2ヶ月",
        "location": "兵庫県神戸市中央区",
        "budget_min": 12000000,
        "budget_max": 16000000,
        "deadline": dl(40),
        "specialty": "電気工事",
    },
    {
        "contractor_idx": 1,
        "title": "吹田市 マンション共用部 照明LED化工事",
        "description": "分譲マンション(200戸)の共用部照明をLEDに交換する工事です。\n\n・対象: エントランス、廊下、階段、駐車場\n・既存器具: 蛍光灯 約350台\n・交換方式: 器具ごと交換\n・工期: 3週間\n\n居住者対応が丁寧にできる業者を希望します。",
        "location": "大阪府吹田市",
        "budget_min": 4000000,
        "budget_max": 6000000,
        "deadline": dl(35),
        "specialty": "電気工事",
    },
    # --- 山本ホームテック (idx 2) ---
    {
        "contractor_idx": 2,
        "title": "横浜市 戸建住宅 外壁・屋根塗装工事",
        "description": "築12年の木造2階建て戸建住宅の外壁・屋根塗装工事です。\n\n【仕様】\n・外壁: フッ素樹脂塗装(下塗り+中塗り+上塗り)\n・屋根: 遮熱シリコン塗装\n・付帯部(雨樋・破風・軒天)塗装含む\n・高圧洗浄+下地補修\n\n丁寧な養生・近隣対応をお願いします。",
        "location": "神奈川県横浜市青葉区",
        "budget_min": 1200000,
        "budget_max": 1800000,
        "deadline": dl(25),
        "specialty": "塗装",
    },
    {
        "contractor_idx": 2,
        "title": "川崎市 マンション浴室リフォーム(10戸一括)",
        "description": "賃貸マンション空室10戸の浴室リフォームを一括で対応いただける業者を募集します。\n\n【工事内容(1戸あたり)】\n・ユニットバス交換(1216サイズ)\n・給排水接続替え\n・電気接続(換気扇・照明)\n・ドア枠廻り補修\n\n1戸あたり2日での施工を想定。部材はこちらで支給します。",
        "location": "神奈川県川崎市",
        "budget_min": 3500000,
        "budget_max": 5000000,
        "deadline": dl(50),
        "specialty": "給排水衛生設備",
    },
    {
        "contractor_idx": 2,
        "title": "藤沢市 店舗内装工事(飲食店)",
        "description": "新規オープンする居酒屋の内装仕上げ工事です。\n\n・店舗面積: 約80m2\n・壁: 木質パネル+左官仕上げ(一部)\n・床: 磁器タイル張り\n・天井: 化粧垂木+板張り\n・カウンター造作\n\n和モダンのデザインに対応できる業者を希望。図面あり。",
        "location": "神奈川県藤沢市",
        "budget_min": 6000000,
        "budget_max": 8000000,
        "deadline": dl(55),
        "specialty": "内装仕上",
    },
    {
        "contractor_idx": 2,
        "title": "横浜市 タイル補修・張り替え工事",
        "description": "マンションエントランス・共用廊下のタイル補修および部分張り替え工事です。\n\n・浮きタイル補修(エポキシ注入): 約50箇所\n・割れタイル張り替え: 約30m2\n・目地補修\n\n居住者通行中の施工となるため、安全対策を徹底できる業者を求めます。",
        "location": "神奈川県横浜市中区",
        "budget_min": 1500000,
        "budget_max": 2200000,
        "deadline": dl(30),
        "specialty": "タイル",
    },
    # --- 佐藤土木 (idx 3) ---
    {
        "contractor_idx": 3,
        "title": "名古屋市 道路改良工事 舗装",
        "description": "市道の拡幅に伴う舗装工事です。\n\n・施工延長: 約800m\n・車道(アスファルト舗装): 幅6.0m\n・歩道(インターロッキング舗装): 幅2.5m\n・路盤工含む\n・交通規制計画の作成・実施\n\n土木施工管理技士1級保有者の配置必須。",
        "location": "愛知県名古屋市緑区",
        "budget_min": 30000000,
        "budget_max": 40000000,
        "deadline": dl(120),
        "specialty": "土木",
    },
    {
        "contractor_idx": 3,
        "title": "豊田市 RC造建物解体工事",
        "description": "工場跡地のRC造建物(地上3階・延床1,500m2)の解体工事です。\n\n【工事概要】\n・建物本体解体\n・基礎撤去\n・アスベスト含有建材処理(レベル3)\n・産業廃棄物運搬・処分\n・整地\n\n解体工事業登録必須。石綿作業主任者の配置が必要です。",
        "location": "愛知県豊田市",
        "budget_min": 15000000,
        "budget_max": 22000000,
        "deadline": dl(60),
        "specialty": "解体",
    },
    {
        "contractor_idx": 3,
        "title": "岡崎市 河川護岸工事 コンクリート施工",
        "description": "二級河川の護岸改修工事におけるコンクリート施工を担当していただきます。\n\n・施工延長: 約120m\n・護岸高: 3.5m\n・場所打ちコンクリート(L型擁壁)\n・鉄筋組立含む\n\n出水期前の完了が必須。河川工事の施工実績がある業者を希望します。",
        "location": "愛知県岡崎市",
        "budget_min": 20000000,
        "budget_max": 28000000,
        "deadline": dl(80),
        "specialty": "コンクリート",
    },
    {
        "contractor_idx": 3,
        "title": "春日井市 下水道管渠布設工事",
        "description": "住宅地における公共下水道の新規布設工事です。\n\n・管種: 硬質塩化ビニル管(VU200)\n・施工延長: 約350m\n・開削工法\n・人孔設置: 8箇所\n・路面復旧(仮復旧+本復旧)\n\n夜間作業が一部発生する可能性があります。",
        "location": "愛知県春日井市",
        "budget_min": 25000000,
        "budget_max": 32000000,
        "deadline": dl(100),
        "specialty": "土木",
    },
    # --- 高橋設備 (idx 4) ---
    {
        "contractor_idx": 4,
        "title": "福岡市 ホテル空調設備更新工事",
        "description": "ビジネスホテル(客室120室)の空調設備全面更新工事です。\n\n【工事内容】\n・客室ファンコイルユニット交換: 120台\n・共用部パッケージエアコン交換: 8台\n・冷温水配管部分更新\n・自動制御更新(中央監視連動)\n\n営業中の施工となるため、騒音・振動対策が重要です。客室単位での施工計画を立てていただきます。",
        "location": "福岡県福岡市博多区",
        "budget_min": 35000000,
        "budget_max": 45000000,
        "deadline": dl(90),
        "specialty": "空調設備",
    },
    {
        "contractor_idx": 4,
        "title": "北九州市 病院 給排水衛生設備改修",
        "description": "総合病院(病床数200床)の給排水衛生設備改修工事です。\n\n・給水管更新(ステンレス管): 各階\n・排水管更新(耐火VP): 各階\n・衛生器具交換: 約80箇所\n・受水槽・高架水槽更新\n\n病院稼働中の施工。断水時間は最小限に。感染対策(養生・粉塵対策)の徹底が必要です。",
        "location": "福岡県北九州市",
        "budget_min": 28000000,
        "budget_max": 38000000,
        "deadline": dl(100),
        "specialty": "給排水衛生設備",
    },
    {
        "contractor_idx": 4,
        "title": "福岡市 飲食店 厨房設備配管工事",
        "description": "新規オープンするラーメン店の厨房設備配管工事です。\n\n・給水配管(給水・給湯)\n・排水配管(グリストラップ設置含む)\n・ガス配管(都市ガス13A)\n・換気フード排気ダクト接続\n\n店舗面積30m2程度。工期1週間。",
        "location": "福岡県福岡市中央区",
        "budget_min": 1500000,
        "budget_max": 2500000,
        "deadline": dl(20),
        "specialty": "給排水衛生設備",
    },
    {
        "contractor_idx": 4,
        "title": "久留米市 工場 屋根改修工事",
        "description": "食品倉庫(鉄骨造・平屋・延床800m2)の屋根改修工事です。\n\n・既存折板屋根の上にカバー工法で新規折板設置\n・断熱材敷設\n・雨樋交換\n・屋根上設備(キュービクル・室外機)の仮移設含む\n\n倉庫稼働中のため、雨漏りが発生しない施工計画が必要です。",
        "location": "福岡県久留米市",
        "budget_min": 8000000,
        "budget_max": 12000000,
        "deadline": dl(50),
        "specialty": "屋根工事",
    },
]


# ---------------------------------------------------------------------------
# メイン処理
# ---------------------------------------------------------------------------
async def main() -> None:
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # --- 専門分野 ---
        specialty_map: dict[str, uuid.UUID] = {}
        for name in SPECIALTIES:
            existing = (
                await session.execute(select(Specialty).where(Specialty.name == name))
            ).scalar_one_or_none()
            if existing:
                specialty_map[name] = existing.id
            else:
                s = Specialty(id=uuid.uuid4(), name=name)
                session.add(s)
                specialty_map[name] = s.id
        await session.flush()
        print(f"専門分野: {len(specialty_map)}件")

        # --- 元請けユーザー + 企業 ---
        companies: list[Company] = []
        for c in CONTRACTORS:
            existing_user = (
                await session.execute(select(User).where(User.email == c["email"]))
            ).scalar_one_or_none()
            if existing_user:
                comp = (
                    await session.execute(
                        select(Company).where(Company.user_id == existing_user.id)
                    )
                ).scalar_one_or_none()
                if comp:
                    companies.append(comp)
                    continue

            user = User(
                id=uuid.uuid4(),
                email=c["email"],
                hashed_password=pwd_context.hash(c["password"]),
                role="contractor",
                is_active=True,
            )
            session.add(user)
            await session.flush()

            ci = c["company"]
            comp = Company(
                id=uuid.uuid4(),
                user_id=user.id,
                name=ci["name"],
                description=ci["description"],
                address=ci["address"],
                phone=ci["phone"],
                website=ci["website"],
                established_year=ci["established_year"],
                employee_count=ci["employee_count"],
            )
            session.add(comp)
            await session.flush()

            # specialties
            for sp_name in ci["specialties"]:
                await session.execute(
                    company_specialties.insert().values(
                        company_id=comp.id, specialty_id=specialty_map[sp_name]
                    )
                )

            companies.append(comp)
        print(f"元請け企業: {len(companies)}社")

        # --- 案件 ---
        count = 0
        for p in PROJECTS:
            proj = Project(
                id=uuid.uuid4(),
                company_id=companies[p["contractor_idx"]].id,
                title=p["title"],
                description=p["description"],
                location=p["location"],
                budget_min=p["budget_min"],
                budget_max=p["budget_max"],
                deadline=p["deadline"],
                status="open",
                required_specialty_id=specialty_map.get(p["specialty"]),
            )
            session.add(proj)
            count += 1
        await session.flush()
        print(f"案件: {count}件")

        await session.commit()
        print("シード完了!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
