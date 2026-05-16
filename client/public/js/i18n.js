const LANG_KEY = 'lang';

const translations = {
  en: {
    // nav
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.pricing': 'Pricing',
    'nav.bookSpace': 'Book Space',
    'nav.userGuide': 'User Guide',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.signOut': 'Sign Out',

    // page titles
    'title.index': 'ArtSpace (아지트) — Find & Book Art Spaces',
    'title.about': 'ArtSpace (아지트) — About',
    'title.pricing': 'ArtSpace (아지트) — Pricing',
    'title.bookspace': 'ArtSpace (아지트) — Book Space',
    'title.guide': 'ArtSpace (아지트) — User Guide',
    'title.login': 'ArtSpace (아지트) — Login',
    'title.signup': 'ArtSpace (아지트) — Sign Up',

    // index — hero
    'hero.eyebrow': '공연장 · 갤러리 · 스튜디오',
    'hero.headline': 'Find &amp; Book<br><span class="headline-accent">Art Spaces</span><br>Across Korea',
    'hero.sub': 'Discover rehearsal rooms, galleries, studios, and<br>performance venues. Check availability and book in minutes.',
    'hero.cta': '🔍 Find a Space',

    // index — dashboard mock
    'db.title': 'ArtSpace (아지트) — Bookings',
    'db.stat.spaces': 'Spaces',
    'db.stat.venues': 'Venues',
    'db.stat.bookings': 'Bookings',
    'db.stat.cities': 'Cities',
    'db.recent': 'Recent Bookings',
    'db.monthly': 'Monthly Bookings',

    // index — partners & stats
    'partners.title': 'Spaces Listed on ArtSpace (아지트)',
    'stat.spaces': 'Spaces Listed',
    'stat.venues': 'Partner Venues',
    'stat.bookings': 'Bookings Made',

    // index — footer
    'footer': '© 2025 ArtSpace (아지트). All rights reserved.',

    // about
    'about.eyebrow': 'Our Story',
    'about.h1': 'About <span>ArtSpace (아지트)</span>',
    'about.sub': "Korea's easiest way to find and book art spaces — rehearsal rooms, studios, galleries, and performance halls.",
    'about.who.h2': 'Who We Are',
    'about.who.p1': 'ArtSpace (아지트) is a space booking platform built specifically for the arts. We connect people who need a space — dancers, musicians, painters, theatre groups — with venues that have one available.',
    'about.who.p2': 'Whether you need a rehearsal room for an afternoon, a gallery for a week-long exhibition, or a performance hall for a one-night show, ArtSpace makes it simple to search, check availability, and confirm a booking.',
    'about.mission.h2': 'Our Mission',
    'about.mission.p': 'Art happens in spaces. Our mission is to make those spaces as easy to access as possible — so more people can create, practice, and perform without the friction of finding and securing a venue.',
    'about.why.h2': 'Why ArtSpace (아지트)?',
    'about.v1.h3': 'Simple Booking',
    'about.v1.p': 'Search by space type, city, and date. See real availability and confirm your booking instantly.',
    'about.v2.h3': 'Spaces for Every Need',
    'about.v2.p': 'From a small practice room to a 500-seat hall — we list spaces of every size and type across Korea.',
    'about.v3.h3': 'For Venues Too',
    'about.v3.p': 'Venue owners can list their spaces, manage availability, and receive booking requests all in one place.',

    // pricing
    'pricing.eyebrow': 'Simple & Transparent',
    'pricing.h1': 'Pricing for <span>ArtSpace (아지트)</span>',
    'pricing.sub': 'Plans for both space users and venue owners. No hidden fees.',
    'pricing.users.label': 'For Space Users — Find & Book',
    'pricing.basic.badge': 'Free',
    'pricing.basic.name': 'Basic',
    'pricing.basic.period': '/ month',
    'pricing.basic.desc': 'For occasional bookings.',
    'pricing.basic.f1': 'Up to 3 bookings per month',
    'pricing.basic.f2': 'Search all listed spaces',
    'pricing.basic.f3': 'Booking confirmation by email',
    'pricing.basic.btn': 'Get Started',
    'pricing.regular.badge': 'Most Popular',
    'pricing.regular.name': 'Regular',
    'pricing.regular.period': '/ month',
    'pricing.regular.desc': 'For frequent space users.',
    'pricing.regular.f1': 'Unlimited bookings',
    'pricing.regular.f2': 'Priority availability access',
    'pricing.regular.f3': 'Booking history & receipts',
    'pricing.regular.f4': 'Cancel up to 24h before',
    'pricing.regular.btn': 'Start Free Trial',
    'pricing.venues.label': 'For Venue Owners — List Your Space',
    'pricing.std.badge': 'Venue',
    'pricing.std.name': 'Standard Listing',
    'pricing.std.period': '/ month',
    'pricing.std.desc': 'List and manage one space.',
    'pricing.std.f1': '1 space listing',
    'pricing.std.f2': 'Availability calendar',
    'pricing.std.f3': 'Booking request management',
    'pricing.std.f4': 'Payout reporting',
    'pricing.std.btn': 'List Your Space',
    'pricing.multi.badge': 'Venue Pro',
    'pricing.multi.name': 'Multi-Space',
    'pricing.multi.period': '/ month',
    'pricing.multi.desc': 'For venues with multiple spaces.',
    'pricing.multi.f1': 'Unlimited space listings',
    'pricing.multi.f2': 'Unified booking dashboard',
    'pricing.multi.f3': 'Custom pricing per space',
    'pricing.multi.f4': 'Dedicated account support',
    'pricing.multi.btn': 'Contact Us',

    // book-space
    'book.eyebrow': 'Find a Space',
    'book.h1': 'Book a <span>Space</span>',
    'book.sub': 'Browse rehearsal rooms, studios, galleries, and performance halls across Korea. Check availability and reserve your spot.',
    'book.notice': 'Log in to make a booking. <a href="/login.html">Sign in</a> or <a href="/signup.html">create an account</a>.',
    'book.filter.all': 'All',
    'book.filter.rehearsal': 'Rehearsal',
    'book.filter.gallery': 'Gallery',
    'book.filter.perfhall': 'Performance Hall',
    'book.filter.studio': 'Studio',
    'book.filter.workshop': 'Workshop',
    'book.cta': 'Check Availability',
    'book.tag.perfhall': 'Performance Hall',
    'book.tag.gallery': 'Gallery',
    'book.tag.rehearsal': 'Rehearsal',
    'book.tag.studio': 'Studio',
    'book.tag.dance': 'Dance',
    'book.tag.workshop': 'Workshop',
    'book.meta.blackbox': 'Capacity: 120 · Mapo-gu, Seoul',
    'book.meta.gallerywhite': 'Capacity: 80 · Haeundae-gu, Busan',
    'book.meta.studioa': 'Capacity: 30 · Mapo-gu, Seoul',
    'book.meta.danceb': 'Capacity: 50 · Jung-gu, Daegu',
    'book.meta.grandhall': 'Capacity: 500 · Yeonsu-gu, Incheon',
    'book.meta.gwangju': 'Capacity: 40 · Dong-gu, Gwangju',
    'book.meta.rooftop': 'Capacity: 200 · Yongsan-gu, Seoul',
    'book.meta.hannam': 'Capacity: 150 · Yongsan-gu, Seoul',

    // user guide
    'guide.eyebrow': 'Documentation',
    'guide.h1': '<span>ArtSpace (아지트)</span> User Guide',
    'guide.sub': 'How to find, book, and manage art spaces on ArtSpace (아지트).',
    'guide.start.h2': '🚀 Getting Started',
    'guide.start.s1.h3': 'Create an Account',
    'guide.start.s1.p': 'Click <strong>Login</strong> on the top-right, then go to Sign Up. Enter your username and password to create a free account.',
    'guide.start.s2.h3': 'Sign In',
    'guide.start.s2.p': 'Once registered, sign in with your username and password. Your account badge will appear in the nav.',
    'guide.find.h2': '🔍 Finding a Space',
    'guide.find.s1.h3': 'Browse Available Spaces',
    'guide.find.s1.p': 'Go to <a href="/book-space.html">Book Space</a>. Use the filters to narrow by type — Rehearsal, Gallery, Performance Hall, Studio, or Workshop.',
    'guide.find.s2.h3': 'Check Availability',
    'guide.find.s2.p': 'Click <strong>Check Availability</strong> on any space card to see the calendar and open time slots.',
    'guide.find.s3.h3': 'Select Your Date & Time',
    'guide.find.s3.p': "Pick a date and time slot that works for you. You'll see the cost per hour or per session before confirming.",
    'guide.book.h2': '📋 Making a Booking',
    'guide.book.s1.h3': 'Confirm Your Booking',
    'guide.book.s1.p': 'Review the space details, date, time, and price. Click <strong>Confirm Booking</strong> to send your request.',
    'guide.book.s2.h3': 'Receive Confirmation',
    'guide.book.s2.p': "You'll receive a booking confirmation by email once the venue approves your request — usually within a few hours.",
    'guide.book.s3.h3': 'Manage Your Bookings',
    'guide.book.s3.p': 'View all upcoming and past bookings from your account dashboard. Cancel or modify at least 24 hours in advance.',
    'guide.venue.h2': '🏛️ Listing Your Space (Venue Owners)',
    'guide.venue.s1.h3': 'Create a Venue Account',
    'guide.venue.s1.p': 'Sign up and select <strong>I own a space</strong>. Upgrade to a Venue plan to list your space on ArtSpace (아지트).',
    'guide.venue.s2.h3': 'Add Your Space',
    'guide.venue.s2.p': 'Fill in your space details — name, location, capacity, type, and hourly rate. Add photos to attract more bookings.',
    'guide.venue.s3.h3': 'Manage Bookings & Availability',
    'guide.venue.s3.p': 'Set your availability calendar, approve or decline booking requests, and track payouts from your venue dashboard.',
    'guide.faq.h2': 'Frequently Asked Questions',
    'guide.faq.q1': 'Is it free to book a space?',
    'guide.faq.a1': 'Creating an account is free. The Basic plan allows up to 3 bookings per month at no cost. See <a href="/pricing.html">Pricing</a> for more.',
    'guide.faq.q2': 'How do I cancel a booking?',
    'guide.faq.a2': 'Go to your dashboard → My Bookings, find the booking, and select Cancel. Cancellations must be made at least 24 hours before the booking time.',
    'guide.faq.q3': 'Can I book a space for multiple days?',
    'guide.faq.a3': 'Yes. When selecting availability, you can choose multiple consecutive time slots or submit a multi-day request directly to the venue.',
    'guide.faq.q4': 'I forgot my password. What do I do?',
    'guide.faq.a4': 'On the login page, click <strong>Forgot password</strong> to receive a reset link by email.',
    'guide.faq.q5': 'How do I list my space?',
    'guide.faq.a5': 'Sign up, upgrade to a Venue plan from <a href="/pricing.html">Pricing</a>, and follow the steps in the Listing section above.',

    // login
    'login.h2': 'Sign In',
    'login.label.username': 'Username',
    'login.ph.username': 'Enter username',
    'login.label.password': 'Password',
    'login.ph.password': 'Enter password',
    'login.btn': 'Sign In',
    'login.switch1': "Don't have an account?",
    'login.switch1.link': 'Sign up',
    'login.back': '← Back to home',

    // signup
    'signup.h2': 'Create Account',
    'signup.label.username': 'Username',
    'signup.ph.username': 'At least 3 characters',
    'signup.label.email': 'Email',
    'signup.ph.email': 'you@example.com',
    'signup.label.phone': 'Phone Number',
    'signup.ph.phone': 'e.g. 010-1234-5678',
    'signup.label.password': 'Password',
    'signup.ph.password': 'At least 6 characters',
    'signup.label.confirm': 'Confirm Password',
    'signup.ph.confirm': 'Repeat password',
    'signup.btn': 'Create Account',
    'signup.switch1': 'Already have an account?',
    'signup.switch1.link': 'Sign in',
    'signup.back': '← Back to home',
  },

  ko: {
    // nav
    'nav.home': '홈',
    'nav.about': '소개',
    'nav.pricing': '요금',
    'nav.bookSpace': '공간 예약',
    'nav.userGuide': '이용 안내',
    'nav.admin': '관리자',
    'nav.login': '로그인',
    'nav.signOut': '로그아웃',

    // page titles
    'title.index': 'ArtSpace (아지트) — 예술 공간 찾기 & 예약',
    'title.about': 'ArtSpace (아지트) — 소개',
    'title.pricing': 'ArtSpace (아지트) — 요금',
    'title.bookspace': 'ArtSpace (아지트) — 공간 예약',
    'title.guide': 'ArtSpace (아지트) — 이용 안내',
    'title.login': 'ArtSpace (아지트) — 로그인',
    'title.signup': 'ArtSpace (아지트) — 회원가입',

    // index — hero
    'hero.eyebrow': '공연장 · 갤러리 · 스튜디오',
    'hero.headline': '찾기 &amp; 예약<br><span class="headline-accent">예술 공간</span><br>전국에서',
    'hero.sub': '연습실, 갤러리, 스튜디오, 공연장을 찾아보세요.<br>빠르게 가용성을 확인하고 예약하세요.',
    'hero.cta': '🔍 공간 찾기',

    // index — dashboard mock
    'db.title': 'ArtSpace (아지트) — 예약 현황',
    'db.stat.spaces': '공간',
    'db.stat.venues': '공연장',
    'db.stat.bookings': '예약',
    'db.stat.cities': '도시',
    'db.recent': '최근 예약',
    'db.monthly': '월별 예약',

    // index — partners & stats
    'partners.title': 'ArtSpace (아지트) 등록 공간',
    'stat.spaces': '등록된 공간',
    'stat.venues': '파트너 공연장',
    'stat.bookings': '총 예약 건수',

    // index — footer
    'footer': '© 2025 ArtSpace (아지트). 모든 권리 보유.',

    // about
    'about.eyebrow': '우리의 이야기',
    'about.h1': '<span>ArtSpace (아지트)</span> 소개',
    'about.sub': '연습실, 스튜디오, 갤러리, 공연장을 가장 쉽게 찾고 예약하는 방법.',
    'about.who.h2': '우리는 누구인가요',
    'about.who.p1': 'ArtSpace (아지트)는 예술 분야를 위해 만들어진 공간 예약 플랫폼입니다. 공간이 필요한 사람들 — 댄서, 음악가, 화가, 연극 단체 — 과 공간을 보유한 공연장을 연결합니다.',
    'about.who.p2': '오후 한 나절의 연습실이든, 일주일간의 갤러리 전시든, 하룻밤 공연장이든 — ArtSpace를 통해 간편하게 검색하고 예약을 확정하세요.',
    'about.mission.h2': '우리의 미션',
    'about.mission.p': '예술은 공간에서 이루어집니다. 우리의 미션은 그 공간을 최대한 쉽게 이용할 수 있도록 만드는 것입니다 — 더 많은 사람들이 번거로움 없이 창작하고, 연습하고, 공연할 수 있도록.',
    'about.why.h2': 'ArtSpace (아지트)를 선택하는 이유',
    'about.v1.h3': '간편한 예약',
    'about.v1.p': '공간 유형, 도시, 날짜로 검색하세요. 실제 가용성을 확인하고 즉시 예약을 확정하세요.',
    'about.v2.h3': '모든 필요를 위한 공간',
    'about.v2.p': '소규모 연습실부터 500석 공연장까지 — 전국의 다양한 크기와 유형의 공간을 등록합니다.',
    'about.v3.h3': '공연장 소유자를 위해서도',
    'about.v3.p': '공연장 소유자는 공간을 등록하고, 가용성을 관리하며, 예약 요청을 한 곳에서 모두 처리할 수 있습니다.',

    // pricing
    'pricing.eyebrow': '간단하고 투명한',
    'pricing.h1': '<span>ArtSpace (아지트)</span> 요금',
    'pricing.sub': '공간 이용자와 공연장 소유자 모두를 위한 요금제. 숨겨진 요금 없음.',
    'pricing.users.label': '공간 이용자용 — 찾기 & 예약',
    'pricing.basic.badge': '무료',
    'pricing.basic.name': '기본',
    'pricing.basic.period': '/ 월',
    'pricing.basic.desc': '가끔 예약하는 분들을 위해.',
    'pricing.basic.f1': '월 최대 3회 예약',
    'pricing.basic.f2': '모든 등록 공간 검색',
    'pricing.basic.f3': '이메일 예약 확인',
    'pricing.basic.btn': '시작하기',
    'pricing.regular.badge': '가장 인기',
    'pricing.regular.name': '레귤러',
    'pricing.regular.period': '/ 월',
    'pricing.regular.desc': '자주 공간을 이용하는 분들을 위해.',
    'pricing.regular.f1': '무제한 예약',
    'pricing.regular.f2': '우선 가용성 접근',
    'pricing.regular.f3': '예약 내역 및 영수증',
    'pricing.regular.f4': '24시간 전까지 취소 가능',
    'pricing.regular.btn': '무료 체험 시작',
    'pricing.venues.label': '공연장 소유자용 — 공간 등록',
    'pricing.std.badge': '공연장',
    'pricing.std.name': '스탠다드 등록',
    'pricing.std.period': '/ 월',
    'pricing.std.desc': '하나의 공간을 등록하고 관리.',
    'pricing.std.f1': '공간 1개 등록',
    'pricing.std.f2': '가용성 캘린더',
    'pricing.std.f3': '예약 요청 관리',
    'pricing.std.f4': '수익 보고',
    'pricing.std.btn': '공간 등록하기',
    'pricing.multi.badge': '공연장 프로',
    'pricing.multi.name': '멀티 공간',
    'pricing.multi.period': '/ 월',
    'pricing.multi.desc': '여러 공간을 보유한 공연장을 위해.',
    'pricing.multi.f1': '무제한 공간 등록',
    'pricing.multi.f2': '통합 예약 대시보드',
    'pricing.multi.f3': '공간별 맞춤 요금 설정',
    'pricing.multi.f4': '전담 계정 지원',
    'pricing.multi.btn': '문의하기',

    // book-space
    'book.eyebrow': '공간 찾기',
    'book.h1': '공간 <span>예약</span>',
    'book.sub': '전국의 연습실, 스튜디오, 갤러리, 공연장을 찾아보세요. 가용성을 확인하고 자리를 예약하세요.',
    'book.notice': '예약하려면 로그인하세요. <a href="/login.html">로그인</a> 또는 <a href="/signup.html">계정 만들기</a>.',
    'book.filter.all': '전체',
    'book.filter.rehearsal': '연습실',
    'book.filter.gallery': '갤러리',
    'book.filter.perfhall': '공연장',
    'book.filter.studio': '스튜디오',
    'book.filter.workshop': '워크숍',
    'book.cta': '예약 가능 확인',
    'book.tag.perfhall': '공연장',
    'book.tag.gallery': '갤러리',
    'book.tag.rehearsal': '연습실',
    'book.tag.studio': '스튜디오',
    'book.tag.dance': '댄스',
    'book.tag.workshop': '워크숍',
    'book.meta.blackbox': '수용 인원: 120 · 서울 마포구',
    'book.meta.gallerywhite': '수용 인원: 80 · 부산 해운대구',
    'book.meta.studioa': '수용 인원: 30 · 서울 마포구',
    'book.meta.danceb': '수용 인원: 50 · 대구 중구',
    'book.meta.grandhall': '수용 인원: 500 · 인천 연수구',
    'book.meta.gwangju': '수용 인원: 40 · 광주 동구',
    'book.meta.rooftop': '수용 인원: 200 · 서울 용산구',
    'book.meta.hannam': '수용 인원: 150 · 서울 용산구',

    // user guide
    'guide.eyebrow': '이용 가이드',
    'guide.h1': '<span>ArtSpace (아지트)</span> 이용 안내',
    'guide.sub': 'ArtSpace (아지트)에서 예술 공간을 찾고, 예약하고, 관리하는 방법.',
    'guide.start.h2': '🚀 시작하기',
    'guide.start.s1.h3': '계정 만들기',
    'guide.start.s1.p': '오른쪽 상단의 <strong>로그인</strong>을 클릭한 후 회원가입으로 이동하세요. 사용자 이름과 비밀번호를 입력해 무료 계정을 만드세요.',
    'guide.start.s2.h3': '로그인',
    'guide.start.s2.p': '등록 후, 사용자 이름과 비밀번호로 로그인하세요. 계정 뱃지가 내비게이션에 표시됩니다.',
    'guide.find.h2': '🔍 공간 찾기',
    'guide.find.s1.h3': '이용 가능한 공간 둘러보기',
    'guide.find.s1.p': '<a href="/book-space.html">공간 예약</a> 페이지로 이동하세요. 필터를 사용해 연습실, 갤러리, 공연장, 스튜디오, 워크숍 등 유형별로 검색하세요.',
    'guide.find.s2.h3': '가용성 확인',
    'guide.find.s2.p': '공간 카드의 <strong>예약 가능 확인</strong>을 클릭해 캘린더와 예약 가능 시간대를 확인하세요.',
    'guide.find.s3.h3': '날짜 & 시간 선택',
    'guide.find.s3.p': '원하는 날짜와 시간대를 선택하세요. 확정 전에 시간당 또는 세션당 비용을 확인할 수 있습니다.',
    'guide.book.h2': '📋 예약하기',
    'guide.book.s1.h3': '예약 확정',
    'guide.book.s1.p': '공간 세부 정보, 날짜, 시간, 가격을 확인하세요. <strong>예약 확정</strong>을 클릭해 요청을 보내세요.',
    'guide.book.s2.h3': '확인 받기',
    'guide.book.s2.p': '공연장이 요청을 승인하면 이메일로 예약 확인서를 받게 됩니다 — 보통 몇 시간 이내.',
    'guide.book.s3.h3': '예약 관리',
    'guide.book.s3.p': '계정 대시보드에서 모든 예정 및 지난 예약을 확인하세요. 예약 시간 24시간 전까지 취소 또는 변경 가능합니다.',
    'guide.venue.h2': '🏛️ 공간 등록 (공연장 소유자)',
    'guide.venue.s1.h3': '공연장 계정 만들기',
    'guide.venue.s1.p': '회원가입 후 <strong>공간을 보유하고 있습니다</strong>를 선택하세요. ArtSpace (아지트)에 공간을 등록하려면 공연장 요금제로 업그레이드하세요.',
    'guide.venue.s2.h3': '공간 추가',
    'guide.venue.s2.p': '공간 세부 정보 — 이름, 위치, 수용 인원, 유형, 시간당 요금을 입력하세요. 사진을 추가해 더 많은 예약을 유도하세요.',
    'guide.venue.s3.h3': '예약 및 가용성 관리',
    'guide.venue.s3.p': '가용성 캘린더를 설정하고, 예약 요청을 승인하거나 거절하며, 공연장 대시보드에서 수익을 추적하세요.',
    'guide.faq.h2': '자주 묻는 질문',
    'guide.faq.q1': '공간 예약은 무료인가요?',
    'guide.faq.a1': '계정 생성은 무료입니다. 기본 요금제는 매월 최대 3회 예약이 무료입니다. 자세한 내용은 <a href="/pricing.html">요금</a> 페이지를 참고하세요.',
    'guide.faq.q2': '예약을 어떻게 취소하나요?',
    'guide.faq.a2': '대시보드 → 내 예약으로 이동해 해당 예약을 찾은 후 취소를 선택하세요. 취소는 예약 시간 24시간 전까지 가능합니다.',
    'guide.faq.q3': '여러 날에 걸쳐 공간을 예약할 수 있나요?',
    'guide.faq.a3': '네. 가용성을 선택할 때 연속된 여러 시간대를 선택하거나 공연장에 직접 다일 요청을 제출할 수 있습니다.',
    'guide.faq.q4': '비밀번호를 잊었어요. 어떻게 하나요?',
    'guide.faq.a4': '로그인 페이지에서 <strong>비밀번호 찾기</strong>를 클릭해 이메일로 재설정 링크를 받으세요.',
    'guide.faq.q5': '공간을 어떻게 등록하나요?',
    'guide.faq.a5': '회원가입 후 <a href="/pricing.html">요금</a> 페이지에서 공연장 요금제로 업그레이드하고, 위의 등록 섹션 단계를 따르세요.',

    // login
    'login.h2': '로그인',
    'login.label.username': '사용자 이름',
    'login.ph.username': '사용자 이름 입력',
    'login.label.password': '비밀번호',
    'login.ph.password': '비밀번호 입력',
    'login.btn': '로그인',
    'login.switch1': '계정이 없으신가요?',
    'login.switch1.link': '회원가입',
    'login.back': '← 홈으로',

    // signup
    'signup.h2': '계정 만들기',
    'signup.label.username': '사용자 이름',
    'signup.ph.username': '최소 3자 이상',
    'signup.label.email': '이메일',
    'signup.ph.email': 'you@example.com',
    'signup.label.phone': '전화번호',
    'signup.ph.phone': '예: 010-1234-5678',
    'signup.label.password': '비밀번호',
    'signup.ph.password': '최소 6자 이상',
    'signup.label.confirm': '비밀번호 확인',
    'signup.ph.confirm': '비밀번호 재입력',
    'signup.btn': '계정 만들기',
    'signup.switch1': '이미 계정이 있으신가요?',
    'signup.switch1.link': '로그인',
    'signup.back': '← 홈으로',
  }
};

function applyTranslations(lang) {
  const t = translations[lang] || translations.en;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t[el.dataset.i18n];
    if (val != null) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const val = t[el.dataset.i18nHtml];
    if (val != null) el.innerHTML = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const val = t[el.dataset.i18nPlaceholder];
    if (val != null) el.placeholder = val;
  });

  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  document.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

let currentLang = localStorage.getItem(LANG_KEY) || 'en';

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-lang]');
  if (btn && btn.dataset.lang) {
    currentLang = btn.dataset.lang;
    localStorage.setItem(LANG_KEY, currentLang);
    applyTranslations(currentLang);
  }
});

applyTranslations(currentLang);
