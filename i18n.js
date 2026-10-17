/* Interface language: RU / EN / UZ. Each entry is [ru, en, uz]; plural entries hold arrays of forms. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(null);
  else root.VMI18n = factory(root);
})(typeof window !== 'undefined' ? window : this, function (win) {
  'use strict';
  var CODES = ['ru', 'en', 'uz'];
  var KEY = 'vm.ui-lang';
  var D = {
    'meta.title': ['Vocabulary Master AI — слова становятся знаниями', 'Vocabulary Master AI — words become knowledge', "Vocabulary Master AI — so'zlar bilimga aylanadi"],
    'meta.desc': ['Вставь слова или готовые пары — ИИ отфильтрует мусор, переведёт на 20 языков и соберёт бесконечный цикл повторений.', 'Paste words or ready pairs — AI filters the junk, translates into 20 languages and builds an endless review loop.', "So'zlar yoki tayyor juftliklarni joylang — sun'iy intellekt keraksizini olib tashlaydi, 20 tilga tarjima qiladi va cheksiz takrorlash siklini tuzadi."],

    'nav.aria': ['Основная навигация', 'Main navigation', 'Asosiy navigatsiya'],
    'nav.home': ['Vocabulary Master AI — на главную', 'Vocabulary Master AI — home', 'Vocabulary Master AI — bosh sahifa'],
    'nav.study': ['Учить слова', 'Study words', "So'z o'rganish"],
    'nav.library': ['Моя библиотека', 'My library', 'Mening kutubxonam'],
    'nav.test': ['Лексический тест', 'Vocabulary test', "Lug'at testi"],
    'top.streak': ['Дни с завершённой тренировкой', 'Days with a finished session', "Mashg'ulot yakunlangan kunlar"],
    'top.theme': ['Сменить тему', 'Switch theme', "Mavzuni almashtirish"],
    'top.motion': ['3D-анимации', '3D animations', '3D animatsiyalar'],
    'top.motionAria': ['Настроить анимации', 'Animation settings', 'Animatsiya sozlamalari'],
    'top.sound': ['Звуки и озвучка (M)', 'Sounds and voice (M)', 'Ovoz va talaffuz (M)'],
    'top.soundOff': ['Выключить звук', 'Mute', "Ovozni o'chirish"],
    'top.soundOn': ['Включить звук', 'Unmute', 'Ovozni yoqish'],
    'top.settings': ['Настройки API', 'API settings', 'API sozlamalari'],
    'top.github': ['Репозиторий на GitHub', 'GitHub repository', 'GitHub repozitoriysi'],
    'top.uiLang': ['Язык интерфейса', 'Interface language', 'Interfeys tili'],

    'hero.eyebrow': ['МАЛЕНЬКАЯ ПРИВЫЧКА. БОЛЬШОЙ СЛОВАРЬ.', 'A SMALL HABIT. A BIG VOCABULARY.', "KICHIK ODAT. KATTA LUG'AT."],
    'hero.h1': ['Не просто слова.<br><em>Твои новые мысли.</em>', 'Not just words.<br><em>Your new thoughts.</em>', "Shunchaki so'zlar emas.<br><em>Yangi fikrlaring.</em>"],
    'hero.sub': ['Собирай слова, которые нужны именно тебе. Вспоминай, ошибайся и пробуй снова — мы вернём сложное в нужный момент.', 'Collect the words you actually need. Recall, make mistakes and try again — we bring the hard ones back at the right moment.', "Aynan senga kerak so'zlarni yig'. Esla, xato qil va yana urin — qiyinlarini kerakli paytda qaytaramiz."],
    'hero.n1': ['Твой темп', 'Your pace', "O'z sur'ating"],
    'hero.n2': ['Умные повторения', 'Smart reviews', 'Aqlli takrorlash'],
    'hero.n3': ['Без регистрации', 'No sign-up', "Ro'yxatdan o'tmasdan"],
    'hero.flip': ['Перевернуть пример карточки', 'Flip the sample card', "Namuna kartani aylantirish"],
    'hero.frontDesc': ['Сначала вспомни. Потом переверни.', 'Recall first. Then flip.', 'Avval esla. Keyin aylantir.'],
    'hero.frontFoot': ['Нажми, чтобы узнать перевод ↗', 'Click to see the meaning ↗', "Tarjimani ko'rish uchun bos ↗"],
    'hero.backTop': ['Русский · перевод', 'English · meaning', "O'zbekcha · tarjima"],
    'hero.backWord': ['счастливая<br>случайность', 'a happy<br>accident', 'baxtli<br>tasodif'],
    'hero.backDesc': ['Найти прекрасное, когда не искал.', 'Finding something lovely without looking.', "Izlamay turib go'zal narsani topish."],
    'hero.backFoot': ['Так слово становится твоим.', 'That is how a word becomes yours.', "So'z shunday seniki bo'ladi."],
    'hero.caption': ['Нажми. Переверни. Запомни.', 'Click. Flip. Remember.', 'Bos. Aylantir. Esla.'],

    'setup.heading': ['Начнём с твоих слов', "Let's start with your words", "Sening so'zlaringdan boshlaymiz"],
    'setup.step': ['01 / Собери свою колоду', '01 / Build your deck', "01 / Kolodangni yig'"],
    'words.title': ['Твои слова', 'Your words', "So'zlaring"],
    'words.paste': ['Вставить', 'Paste', 'Joylash'],
    'words.clear': ['Очистить', 'Clear', 'Tozalash'],
    'words.examples': ['Примеры', 'Examples', 'Namunalar'],
    'preset.verbs': ['Глаголы', 'Verbs', "Fe'llar"],
    'preset.travel': ['Путешествия', 'Travel', 'Sayohat'],
    'preset.advanced': ['Продвинутые', 'Advanced', 'Murakkab'],
    'words.placeholder': ['serendipity\nresilience\nto achieve\napple - яблоко\nhouse : дом\n...', 'serendipity\nresilience\nto achieve\napple - pomme\nhouse : maison\n...', 'serendipity\nresilience\nto achieve\napple - olma\nhouse : uy\n...'],
    'words.hint': ['по одному в строке, через запятую или готовые пары «слово — перевод»', 'one per line, comma-separated, or ready pairs "word — translation"', "har qatorda bittadan, vergul bilan yoki tayyor juftliklar «so'z — tarjima»"],
    'words.count': [['{n} слово', '{n} слова', '{n} слов'], ['{n} word', '{n} words'], ["{n} ta so'z"]],
    'words.dropped': [' · отброшено {n}', ' · {n} dropped', ' · {n} ta tashlandi'],

    'session.title': ['Настройки сессии', 'Session settings', 'Sessiya sozlamalari'],
    'status.ready': ['● Готов к работе', '● Ready', '● Tayyor'],
    'status.server': ['● Vercel ИИ онлайн', '● Vercel AI online', '● Vercel AI onlayn'],
    'status.browserKey': ['● Браузерный API ключ', '● Browser API key', '● Brauzer API kaliti'],
    'status.free': ['⚡ Бесплатный авто-режим', '⚡ Free auto mode', '⚡ Bepul avto-rejim'],
    'summ.server': ['Серверный ключ', 'Server key', 'Server kaliti'],
    'summ.browserKey': ['Ключ браузера', 'Browser key', 'Brauzer kaliti'],
    'summ.free': ['Автономно', 'Offline', 'Avtonom'],
    'lang.learn': ['Я изучаю', "I'm learning", "O'rganayapman"],
    'lang.native': ['Мой родной язык', 'My native language', 'Ona tilim'],
    'lang.swap': ['Поменять языки местами (Alt+X)', 'Swap languages (Alt+X)', 'Tillarni almashtirish (Alt+X)'],
    'lang.swapAria': ['Поменять языки местами', 'Swap languages', 'Tillarni almashtirish'],
    'dir.label': ['Направление карточек', 'Card direction', "Karta yo'nalishi"],
    'dir.mixed': ['Смешанное', 'Mixed', 'Aralash'],
    'dir.fwd': ['Слово → перевод', 'Word → translation', "So'z → tarjima"],
    'dir.rev': ['Перевод → слово', 'Translation → word', "Tarjima → so'z"],
    'mode.label': ['Как отвечать', 'How to answer', 'Qanday javob berish'],
    'mode.flashcard': ['Карточки', 'Flashcards', 'Kartalar'],
    'mode.typing': ['Написать ответ', 'Type the answer', 'Javobni yozish'],
    'mode.simple': ['Только слово и перевод', 'Word and translation only', "Faqat so'z va tarjima"],
    'api.title': ['ИИ-провайдер', 'AI provider', 'AI provayder'],
    'api.auto': ['Авто-режим', 'Auto mode', 'Avto-rejim'],
    'api.hint': ['<strong>Ключ можно дать позже.</strong> Без ключа работает встроенный бесплатный авто-переводчик. Для умных мнемоник и фильтрации подключи любой OpenAI-совместимый API — OpenAI, Groq, OpenRouter или DeepSeek.', '<strong>You can add a key later.</strong> Without a key the built-in free auto-translator is used. For smart mnemonics and filtering, connect any OpenAI-compatible API — OpenAI, Groq, OpenRouter or DeepSeek.', "<strong>Kalitni keyinroq berish mumkin.</strong> Kalitsiz o'rnatilgan bepul avto-tarjimon ishlaydi. Aqlli mnemonika va filtrlash uchun istalgan OpenAI-mos API ni ulang — OpenAI, Groq, OpenRouter yoki DeepSeek."],
    'api.quick': ['Быстрый выбор', 'Quick pick', 'Tez tanlash'],
    'api.free': ['Без ключа', 'No key', 'Kalitsiz'],
    'api.model': ['Модель', 'Model', 'Model'],
    'api.key': ['API-ключ <em>хранится только локально в браузере</em>', 'API key <em>stored only locally in your browser</em>', "API kaliti <em>faqat brauzeringizda saqlanadi</em>"],
    'api.keyPh': ['sk-... — оставь пустым для авто-режима', 'sk-... — leave empty for auto mode', "sk-... — avto-rejim uchun bo'sh qoldiring"],
    'api.save': ['Сохранить', 'Save', 'Saqlash'],
    'api.reset': ['Сбросить', 'Reset', 'Tiklash'],
    'setup.start': ['Создать тренировку', 'Start training', "Mashg'ulotni boshlash"],
    'setup.demo': ['Демо-колода на 14 слов', 'Demo deck of 14 words', "14 so'zli demo koloda"],
    'setup.resume': ['Продолжить прошлую сессию — ', 'Continue your last session — ', 'Oldingi sessiyani davom ettirish — '],
    'setup.resumeLink': ['открыть сохранённую колоду', 'open the saved deck', 'saqlangan kolodani ochish'],
    'setup.foot': ['Прогресс хранится на этом устройстве. Слова для перевода отправляются выбранному сервису.', 'Progress is stored on this device. Words to translate are sent to the selected service.', "Natijalar shu qurilmada saqlanadi. Tarjima uchun so'zlar tanlangan xizmatga yuboriladi."],
    'welcome.h': ['Добро пожаловать в Vocabulary Master AI!', 'Welcome to Vocabulary Master AI!', 'Vocabulary Master AI ga xush kelibsiz!'],
    'welcome.p': ['Учи новые слова без усилий! Добавляй свои списки, тренируйся на карточках или вводом ответа, а встроенный ИИ-перевод подскажет. Адаптивная система возвращает трудные слова в колоду, чтобы ты их не забывал.', 'Master new vocabulary effortlessly! Add your own word lists, practice with smart flashcards or typing modes, and let built-in AI translation guide your learning. Our adaptive system automatically reshuffles tricky words back into your deck so you never forget them!', "Yangi so'zlarni oson o'rgan! O'z ro'yxatlaringni qo'sh, kartalar yoki javob yozish orqali mashq qil, o'rnatilgan AI tarjima esa yordam beradi. Moslashuvchan tizim qiyin so'zlarni kolodaga qaytaradi — sen ularni unutmaysan."],

    'load.title': ['ИИ разбирает твой список…', 'AI is reading your list…', "AI ro'yxatingni tahlil qilmoqda…"],
    'load.step': ['Фильтрую мусор и дубликаты', 'Filtering junk and duplicates', 'Keraksiz va takrorlarni filtrlayapman'],
    'load.cancel': ['Отмена', 'Cancel', 'Bekor qilish'],
    'load.processing': ['Обрабатываю твой список слов…', 'Processing your word list…', "So'zlar ro'yxatini qayta ishlayapman…"],
    'load.analyzing': ['Анализирую список и фильтрую дубликаты', 'Analysing the list and removing duplicates', "Ro'yxatni tahlil qilib, takrorlarni olib tashlayapman"],
    'load.selected': ['Отобрано: {n}', 'Selected: {n}', 'Tanlandi: {n}'],
    'load.droppedN': [' · отсеяно: {n}', ' · dropped: {n}', ' · tashlandi: {n}'],
    'load.free': ['Перевод без API ({i} из {n})…', 'Translating without API ({i} of {n})…', 'API siz tarjima ({i} / {n})…'],
    'load.card': ['Карточка: {w}', 'Card: {w}', 'Karta: {w}'],
    'load.allPaired': ['Все пары уже переведены!', 'All pairs are already translated!', 'Barcha juftliklar allaqachon tarjima qilingan!'],
    'load.ready': ['Готово карточек: {n}', 'Cards ready: {n}', 'Tayyor kartalar: {n}'],
    'load.aiPart': ['ИИ переводит часть {i} из {n}', 'AI is translating part {i} of {n}', 'AI {n} qismdan {i}-ni tarjima qilmoqda'],
    'load.aiOne': ['ИИ фильтрует и переводит слова…', 'AI is filtering and translating…', "AI so'zlarni filtrlab, tarjima qilmoqda…"],
    'load.processed': ['Обработано: {a} / {b}', 'Processed: {a} / {b}', 'Qayta ishlandi: {a} / {b}'],
    'load.done': ['Готово!', 'Done!', 'Tayyor!'],
    'load.cards': ['Карточек: {n}', 'Cards: {n}', 'Kartalar: {n}'],
    'hint.assoc': ['ассоциация: {w}', 'association: {w}', 'assotsiatsiya: {w}'],

    'train.heading': ['Время вспомнить', 'Time to recall', 'Eslash vaqti'],
    'train.daily': ['Твоя ежедневная практика', 'Your daily practice', 'Kundalik mashqing'],
    'st.round': ['раунд', 'round', 'raund'],
    'st.known': ['знал', 'knew', 'bildim'],
    'st.forgot': ['забыл', 'forgot', 'unutdim'],
    'st.acc': ['точность', 'accuracy', 'aniqlik'],
    'st.time': ['время', 'time', 'vaqt'],
    'st.left': ['в очереди', 'in queue', 'navbatda'],
    'st.cards': ['карточек', 'cards', 'kartalar'],
    'st.answers': ['ответов', 'answers', 'javoblar'],
    'train.roundBar': ['Прогресс раунда', 'Round progress', 'Raund jarayoni'],
    'train.sheet': ['Ещё одно открытие', 'One more discovery', 'Yana bir kashfiyot'],
    'train.space': ['пробел', 'space', 'probel'],
    'card.title': ['Нажми, чтобы перевернуть (Space)', 'Click to flip (Space)', 'Aylantirish uchun bos (Space)'],
    'card.original': ['оригинал', 'original', 'asl'],
    'card.translation': ['перевод', 'translation', 'tarjima'],
    'card.speakWord': ['Озвучить слово (S)', 'Speak the word (S)', "So'zni o'qish (S)"],
    'card.speakTrans': ['Озвучить перевод (S)', 'Speak the translation (S)', "Tarjimani o'qish (S)"],
    'card.speak': ['Озвучить', 'Speak', "O'qib berish"],
    'card.subFwd': ['вспомни перевод, потом переверни', 'recall the translation, then flip', "tarjimani esla, keyin aylantir"],
    'card.subRev': ['назови слово, потом переверни', 'name the word, then flip', "so'zni ayt, keyin aylantir"],
    'card.swipe': ['← повторить <span>свайп</span> знаю →', '← again <span>swipe</span> know it →', '← yana <span>surish</span> bilaman →'],
    'keys.flip': ['перевернуть', 'flip', 'aylantirish'],
    'keys.forgot': ['не помню', "don't know", 'eslay olmadim'],
    'keys.knew': ['знал', 'knew it', 'bildim'],
    'keys.speak': ['озвучить', 'speak', "o'qish"],
    'keys.exit': ['ливнуть', 'leave', 'chiqish'],
    'keys.hint': ['подсказка', 'hint', 'yordam'],
    'btn.reveal': ['Показать перевод', 'Show translation', "Tarjimani ko'rsatish"],
    'btn.knewNow': ['Знал сразу', 'Knew it', 'Darrov bildim'],
    'typing.ph': ['Твой перевод…', 'Your translation…', 'Tarjimang…'],
    'typing.hint': ['Показать первые буквы', 'Show first letters', "Birinchi harflarni ko'rsatish"],
    'typing.check': ['Проверить', 'Check', 'Tekshirish'],
    'btn.next': ['Дальше →', 'Next →', 'Keyingi →'],
    'btn.forgot': ['Не вспомнил — повторить', "Didn't recall — repeat", 'Eslay olmadim — takrorlash'],
    'btn.remembered': ['Запомнил', 'Got it', 'Esladim'],
    'tools.speak': ['Озвучить', 'Speak', "O'qish"],
    'tools.speakTitle': ['Озвучить (S)', 'Speak (S)', "O'qish (S)"],
    'tools.hint': ['💡 Подсказка', '💡 Hint', '💡 Yordam'],
    'tools.hintTitle': ['Первые буквы ответа (H)', 'First letters of the answer (H)', 'Javobning birinchi harflari (H)'],
    'tools.dir': ['↻ Направление', '↻ Direction', "↻ Yo'nalish"],
    'tools.shuffle': ['⤨ Перемешать', '⤨ Shuffle', '⤨ Aralashtirish'],
    'tools.newSet': ['✦ Новый набор', '✦ New set', "✦ Yangi to'plam"],
    'tools.newSetTitle': ['Выбрать новый набор слов', 'Pick a new word set', "Yangi so'zlar to'plamini tanlash"],
    'tools.exit': ['Ливнуть ✕', 'Leave ✕', 'Chiqish ✕'],
    'tools.exitTitle': ['Завершить сессию', 'Finish the session', 'Sessiyani yakunlash'],

    'lib.eyebrow': ['ТВОЯ КОЛЛЕКЦИЯ ЗНАНИЙ', 'YOUR KNOWLEDGE COLLECTION', "BILIMLAR TO'PLAMING"],
    'lib.h1': ['Моя библиотека', 'My library', 'Mening kutubxonam'],
    'lib.sub': ['Всё, что ты уже знаешь. И то, что скоро запомнишь.', 'Everything you already know. And what you will soon remember.', 'Bilganlaring hammasi. Va tez orada eslab qoladiganlaring.'],
    'lib.newDeck': ['+ Новая колода', '+ New deck', '+ Yangi koloda'],
    'daily.title0': ['Сегодня — новый шаг', 'Today is a new step', 'Bugun — yangi qadam'],
    'daily.done': ['На сегодня — отлично.', 'Great work for today.', "Bugun uchun — a'lo."],
    'daily.almost': ['Ещё немного — и это привычка.', 'A little more and it becomes a habit.', "Yana ozgina — va bu odatga aylanadi."],
    'daily.text': ['{a} из {g} ответов сегодня', '{a} of {g} answers today', 'Bugun {g} tadan {a} ta javob'],
    'daily.goal': ['Цель', 'Goal', 'Maqsad'],
    'daily.goalAria': ['Дневная цель', 'Daily goal', 'Kunlik maqsad'],
    'freeze.left': ['· осталось {n}', '· {n} left', '· {n} ta qoldi'],
    'streak.days': [['{n} день', '{n} дня', '{n} дней'], ['{n} day', '{n} days'], ['{n} kun']],
    'act.title': ['Активность', 'Activity', 'Faollik'],
    'act.aria': ['Ответы за последние 12 недель', 'Answers over the last 12 weeks', "So'nggi 12 haftadagi javoblar"],
    'act.less': ['меньше', 'less', 'kam'],
    'act.more': ['больше', 'more', "ko'p"],
    'act.days': [['{n} активный день', '{n} активных дня', '{n} активных дней'], ['{n} active day', '{n} active days'], ['{n} faol kun']],
    'act.answers': [['{n} ответ', '{n} ответа', '{n} ответов'], ['{n} answer', '{n} answers'], ['{n} ta javob']],
    'act.mastered': ['{n} закреплено', '{n} mastered', "{n} ta o'zlashtirildi"],
    'search.ph': ['Найти слово или перевод…', 'Find a word or translation…', "So'z yoki tarjimani topish…"],
    'search.aria': ['Поиск по библиотеке', 'Search the library', "Kutubxonadan qidirish"],
    'search.found': ['Найдено: {n}', 'Found: {n}', 'Topildi: {n}'],
    'search.none': ['Ничего не нашлось по «{q}»', 'Nothing found for "{q}"', "«{q}» bo'yicha hech narsa topilmadi"],
    'search.mistakes': [' · ошибок: {n}', ' · mistakes: {n}', ' · xatolar: {n}'],
    'lib.export': ['Скачать резервную копию', 'Download backup', 'Zaxira nusxani yuklab olish'],
    'lib.import': ['Восстановить из файла', 'Restore from file', 'Fayldan tiklash'],
    'lib.emptyH': ['Место для твоих открытий', 'A place for your discoveries', 'Kashfiyotlaring uchun joy'],
    'lib.emptyP': ['Создай первую тренировку — её слова останутся здесь.', 'Create your first session — its words will stay here.', "Birinchi mashg'ulotni yarat — uning so'zlari shu yerda qoladi."],
    'lib.emptyBtn': ['Добавить слова →', 'Add words →', "So'z qo'shish →"],
    'deck.stats': ['{m} закреплено · {d} к повторению · {h}', '{m} mastered · {d} due · {h}', "{m} o'zlashtirildi · {d} takrorlashga · {h}"],
    'deck.hard': [['{n} сложное', '{n} сложных', '{n} сложных'], ['{n} hard', '{n} hard'], ['{n} ta qiyin']],
    'deck.practiceDue': ['Повторить · {n} →', 'Review · {n} →', 'Takrorlash · {n} →'],
    'deck.practiceAll': ['Повторить всё →', 'Review all →', 'Hammasini takrorlash →'],
    'deck.practiceTitle': ['Сначала слова, срок которых подошёл', 'Words that are due come first', "Avval muddati kelgan so'zlar"],
    'deck.hardBtn': ['Сложные · {n}', 'Hard · {n}', 'Qiyinlar · {n}'],
    'deck.hardTitle': ['Только слова с ошибками', 'Only words with mistakes', "Faqat xato qilingan so'zlar"],
    'deck.add': ['+ Слова', '+ Words', "+ So'zlar"],
    'deck.reverse': ['⇄ Развернуть языки', '⇄ Reverse languages', "⇄ Tillarni almashtirish"],
    'deck.reverseTitle': ['Создать колоду {p}', 'Create a {p} deck', '{p} kolodasini yaratish'],
    'deck.copy': ['Скопировать списком', 'Copy as list', "Ro'yxat qilib nusxalash"],
    'deck.all': ['Все слова · редактировать', 'All words · edit', "Barcha so'zlar · tahrirlash"],
    'deck.delete': ['Удалить колоду', 'Delete deck', "Kolodani o'chirish"],
    'word.edit': ['Изменить', 'Edit', "O'zgartirish"],
    'word.remove': ['Убрать', 'Remove', 'Olib tashlash'],
    'word.prompt': ['Перевод для «{w}»', 'Translation for "{w}"', '«{w}» uchun tarjima'],
    'confirm.deleteDeck': ['Удалить эту колоду и её прогресс?', 'Delete this deck and its progress?', "Bu koloda va uning natijalari o'chirilsinmi?"],
    'confirm.replace': ['Заменить текущую библиотеку резервной копией?', 'Replace the current library with the backup?', 'Joriy kutubxona zaxira nusxa bilan almashtirilsinmi?'],
    'motion.summary': ['За кулисами: Native motion / EffectCraft', 'Behind the scenes: Native motion / EffectCraft', 'Sahna ortida: Native motion / EffectCraft'],
    'motion.p': ['Спокойное движение интерфейса — CSS. Ниже — сохранённый рендер композиции из EffectCraft CLI; это отдельный motion-этюд, не стиль приложения.', 'The calm interface motion is CSS. Below is a saved render of an EffectCraft CLI composition — a separate motion study, not the app style.', "Interfeysdagi yumshoq harakat — CSS. Quyida EffectCraft CLI kompozitsiyasining saqlangan renderi — bu alohida motion-etyud, ilova uslubi emas."],
    'motion.native': ['Слово за словом.', 'Word by word.', "So'zma-so'z."],
    'motion.video': ['Композиция EffectCraft', 'EffectCraft composition', 'EffectCraft kompozitsiyasi'],

    'test.h1': ['Проверь глубину словаря', 'Test the depth of your vocabulary', "Lug'atingning chuqurligini tekshir"],
    'test.sub': ['Контекстные вопросы и точное значение. Четыре варианта, один ответ.', 'Context questions and exact meaning. Four options, one answer.', "Kontekstli savollar va aniq ma'no. To'rt variant, bitta javob."],
    'test.deck': ['Выбери колоду', 'Choose a deck', 'Kolodani tanla'],
    'test.start': ['Начать мини-тест →', 'Start mini test →', 'Mini testni boshlash →'],
    'test.note': ['Нужно минимум 4 разных слова. Если есть примеры — используем пропуски в предложениях, иначе проверим значение.', 'At least 4 different words are needed. With examples we use gaps in sentences, otherwise we test the meaning.', "Kamida 4 ta turli so'z kerak. Misollar bo'lsa — gapdagi bo'shliqlardan foydalanamiz, aks holda ma'nosini tekshiramiz."],
    'quiz.progress': ['ВОПРОС {i} / {n}', 'QUESTION {i} / {n}', 'SAVOL {i} / {n}'],
    'quiz.meaning': ['Какое слово означает «{w}»?', 'Which word means "{w}"?', "Qaysi so'z «{w}» degan ma'noni bildiradi?"],
    'quiz.correct': ['Верно. ', 'Correct. ', "To'g'ri. "],
    'quiz.answerWas': ['Правильный ответ: ', 'Correct answer: ', "To'g'ri javob: "],
    'quiz.done': ['ТЕСТ ЗАВЕРШЁН', 'TEST COMPLETE', 'TEST YAKUNLANDI'],
    'quiz.score': ['{c} из {n} — так держать.', '{c} of {n} — keep it up.', '{n} tadan {c} ta — shunday davom et.'],
    'quiz.saved': ['Ошибки сохранены: сложные слова вернутся в практику.', 'Mistakes are saved: hard words will come back to practice.', "Xatolar saqlandi: qiyin so'zlar mashqqa qaytadi."],

    'footer.tag': ['Меньше шума. Больше смысла.', 'Less noise. More meaning.', "Kamroq shovqin. Ko'proq ma'no."],
    'footer.made': ['Сделано для ежедневной практики · v2.8', 'Made for daily practice · v2.8', 'Kundalik mashq uchun yaratilgan · v2.8'],
    'sum.title': ['Сессия завершена', 'Session complete', 'Sessiya yakunlandi'],
    'sum.continue': ['Продолжить цикл', 'Keep looping', 'Siklni davom ettirish'],
    'sum.newSet': ['Новый набор слов', 'New word set', "Yangi so'zlar to'plami"],
    'sum.copy': ['Скопировать статистику', 'Copy stats', 'Statistikani nusxalash'],
    'sum.msg0': ['Сессия только началась. Возвращайся в цикл в любой момент!', 'The session has just started. Come back to the loop any time!', 'Sessiya endi boshlandi. Istalgan payt siklga qayt!'],
    'sum.msg90': [['Отличная память! {n} слово запомнилось на автомате.', 'Отличная память! {n} слова запомнились на автомате.', 'Отличная память! {n} слов запомнились на автомате.'], ['Great memory! {n} word stuck automatically.', 'Great memory! {n} words stuck automatically.'], ["Ajoyib xotira! {n} ta so'z avtomatik esda qoldi."]],
    'sum.msg65': ['Хороший прогресс — цикл вернул забытые слова, закрепление идёт полным ходом.', 'Good progress — the loop brought back forgotten words, they are sticking.', "Yaxshi natija — sikl unutilgan so'zlarni qaytardi, mustahkamlash davom etmoqda."],
    'sum.msgLow': ['Всё по плану: забыл → карточка перевернулась → слово вернулось в очередь.', 'All according to plan: forgot → card flipped → the word went back to the queue.', "Hammasi reja bo'yicha: unutding → karta aylandi → so'z navbatga qaytdi."],
    'sum.stats': ['Vocabulary Master AI: {c} карточек · {a} ответов · {p}% точность · раунд {r} · время {t}', 'Vocabulary Master AI: {c} cards · {a} answers · {p}% accuracy · round {r} · time {t}', 'Vocabulary Master AI: {c} karta · {a} javob · {p}% aniqlik · {r}-raund · vaqt {t}'],
    'goal.title': ['Ещё один шаг вперёд.', 'One more step forward.', 'Yana bir qadam oldinga.'],
    'goal.text': ['Дневная цель достигнута. Хорошая работа!', 'Daily goal reached. Nice work!', 'Kunlik maqsadga erishildi. Barakalla!'],
    'goal.close': ['Закрыть уведомление', 'Close notification', 'Bildirishnomani yopish'],

    'pill.cards': [['{n} карточка', '{n} карточки', '{n} карточек'], ['{n} card', '{n} cards'], ['{n} ta karta']],
    'feedback.answer': ['Правильный ответ: {a}', 'Correct answer: {a}', "To'g'ri javob: {a}"],
    'feedback.right': ['Верно. {a}', 'Correct. {a}', "To'g'ri. {a}"],
    'feedback.almost': ['Почти. Правильный ответ: {a}', 'Almost. Correct answer: {a}', "Deyarli. To'g'ri javob: {a}"],
    'float.combo': ['🔥 серия ×{n}', '🔥 streak ×{n}', '🔥 seriya ×{n}'],
    'float.back': ['↺ вернётся в цикл', '↺ back to the loop', '↺ siklga qaytadi'],
    'verdict.ok': ['✓  В памяти', '✓  Remembered', '✓  Esda'],
    'verdict.no': ['↻  Вернётся в колоду', '↻  Back to the deck', '↻  Kolodaga qaytadi'],
    'motion.onAria': ['Включить полные 3D-анимации', 'Turn on full 3D animations', "To'liq 3D animatsiyalarni yoqish"],
    'motion.offAria': ['Выключить анимации', 'Turn off animations', "Animatsiyalarni o'chirish"],
    'motion.offTitle': ['Движение выключено. Нажми для полного 3D.', 'Motion is off. Click for full 3D.', "Harakat o'chirilgan. To'liq 3D uchun bos."],
    'motion.onTitle': ['Полные 3D-анимации включены', 'Full 3D animations are on', "To'liq 3D animatsiyalar yoqilgan"],

    'toast.soundOn': ['Звук включён 🔊', 'Sound on 🔊', 'Ovoz yoqildi 🔊'],
    'toast.soundOff': ['Звук выключен 🔇', 'Sound off 🔇', "Ovoz o'chirildi 🔇"],
    'toast.freeTr': ['Перевожу через бесплатный авто-переводчик ⚡', 'Translating with the free auto-translator ⚡', 'Bepul avto-tarjimon orqali tarjima qilyapman ⚡'],
    'toast.noWords': ['Не найдено ни одного слова 🤔', 'No words found 🤔', "Birorta ham so'z topilmadi 🤔"],
    'toast.deckReady': [['Колода готова: {n} слово. Погнали! 🚀', 'Колода готова: {n} слова. Погнали! 🚀', 'Колода готова: {n} слов. Погнали! 🚀'], ['Deck ready: {n} word. Let\'s go! 🚀', 'Deck ready: {n} words. Let\'s go! 🚀'], ["Koloda tayyor: {n} ta so'z. Ketdik! 🚀"]],
    'toast.round': ['Раунд {n} 🔁 Закрепляем: сложные слова в начале!', 'Round {n} 🔁 Hard words go first!', "{n}-raund 🔁 Qiyin so'zlar birinchi!"],
    'toast.newSet': ['Введи или выбери новый набор слов ✍️', 'Type or pick a new set of words ✍️', "Yangi so'zlar to'plamini kirit yoki tanla ✍️"],
    'toast.diffLangs': ['Выбери разные языки для изучения и перевода.', 'Pick different languages to learn and translate into.', "O'rganish va tarjima uchun turli tillarni tanla."],
    'toast.pasteWords': ['Вставь слова или нажми один из примеров 👀', 'Paste words or pick one of the examples 👀', "So'zlarni joyla yoki namunalardan birini bos 👀"],
    'err.noCards': ['Не удалось сформировать карточки.', 'Could not build the cards.', "Kartalarni tuzib bo'lmadi."],
    'err.generic': ['Ошибка генерации тренировки', 'Failed to build the session', "Mashg'ulotni yaratishda xato"],
    'err.emptyServer': ['Пустой ответ от сервера', 'Empty response from the server', "Serverdan bo'sh javob"],
    'err.serverStatus': ['Серверный API ответил {s}', 'Server API replied {s}', 'Server API {s} bilan javob berdi'],
    'err.apiStatus': ['API вернул {s}', 'API returned {s}', 'API {s} qaytardi'],
    'err.emptyModel': ['Пустой ответ модели', 'Empty model response', "Modeldan bo'sh javob"],
    'toast.swap': ['{p}', '{p}', '{p}'],
    'toast.swapPairs': [' · пары в списке развёрнуты', ' · pairs in the list were flipped', " · ro'yxatdagi juftliklar almashtirildi"],
    'toast.noHard': ['Сложных слов пока нет 🎉', 'No hard words yet 🎉', "Hozircha qiyin so'zlar yo'q 🎉"],
    'toast.needTr': ['Сначала укажи переводы в списке слов.', 'Add translations in the word list first.', "Avval so'zlar ro'yxatida tarjimalarni ko'rsat."],
    'toast.reversed': ['Готово: {p} · +{n}', 'Done: {p} · +{n}', 'Tayyor: {p} · +{n}'],
    'toast.reverseSame': ['Развёрнутая колода уже актуальна', 'The reversed deck is already up to date', 'Teskari koloda allaqachon yangilangan'],
    'toast.copied': ['Список скопирован 📋 — его можно вставить в новую колоду', 'List copied 📋 — you can paste it into a new deck', "Ro'yxat nusxalandi 📋 — uni yangi kolodaga joylash mumkin"],
    'toast.saveFail': ['Не удалось сохранить прогресс. Проверь свободное место в браузере.', 'Could not save progress. Check free space in your browser.', "Natijani saqlab bo'lmadi. Brauzerdagi bo'sh joyni tekshir."],
    'toast.addWords': ['Добавь слова в колоду.', 'Add words to the deck.', "Kolodaga so'z qo'sh."],
    'err.fileBig': ['Файл слишком большой (максимум 5 МБ).', 'File is too large (max 5 MB).', 'Fayl juda katta (maksimum 5 MB).'],
    'err.notBackup': ['Это не резервная копия Vocabulary Master AI.', 'This is not a Vocabulary Master AI backup.', 'Bu Vocabulary Master AI zaxira nusxasi emas.'],
    'err.badDeck': ['Некорректная колода.', 'Invalid deck.', "Noto'g'ri koloda."],
    'err.badWord': ['Некорректное слово.', 'Invalid word.', "Noto'g'ri so'z."],
    'err.readFile': ['Не удалось прочитать файл.', 'Could not read the file.', "Faylni o'qib bo'lmadi."],
    'toast.restored': ['Библиотека восстановлена.', 'Library restored.', 'Kutubxona tiklandi.'],
    'toast.createDeck': ['Сначала создай колоду.', 'Create a deck first.', 'Avval koloda yarat.'],
    'toast.need4': ['Нужны минимум 4 слова с разными значениями.', 'At least 4 words with different meanings are needed.', "Kamida 4 ta turli ma'noli so'z kerak."],
    'toast.clipEmpty': ['Буфер пуст', 'Clipboard is empty', "Bufer bo'sh"],
    'toast.pasted': ['Слова вставлены из буфера', 'Words pasted from clipboard', "So'zlar buferdan joylandi"],
    'toast.clipBlocked': ['Браузер ограничил доступ к буферу — нажми Ctrl+V в поле', 'The browser blocked clipboard access — press Ctrl+V in the field', 'Brauzer buferga kirishni chekladi — maydonda Ctrl+V ni bos'],
    'toast.preset': ['Загружен набор «{n}»', 'Loaded set "{n}"', "«{n}» to'plami yuklandi"],
    'toast.provFree': ['Включён бесплатный авто-перевод без ключа', 'Free keyless auto-translation is on', 'Kalitsiz bepul avto-tarjima yoqildi'],
    'toast.provOpenai': ['Выбран OpenAI. Введи свой ключ sk-...', 'OpenAI selected. Enter your sk-... key', 'OpenAI tanlandi. sk-... kalitingni kirit'],
    'toast.provGroq': ['Выбран Groq (быстрый бесплатный API)', 'Groq selected (fast free API)', 'Groq tanlandi (tez bepul API)'],
    'toast.provOpenrouter': ['Выбран OpenRouter', 'OpenRouter selected', 'OpenRouter tanlandi'],
    'toast.cfgSaved': ['Настройки сохранены 💾', 'Settings saved 💾', 'Sozlamalar saqlandi 💾'],
    'toast.cfgReset': ['Сброшено к авто-режиму', 'Reset to auto mode', 'Avto-rejimga qaytarildi'],
    'toast.demo': ['Демо-колода загружена!', 'Demo deck loaded!', 'Demo koloda yuklandi!'],
    'toast.resumeFail': ['Сессия не восстановилась', 'Could not restore the session', "Sessiyani tiklab bo'lmadi"],
    'toast.shuffled': ['Очередь перемешана ⤨', 'Queue shuffled ⤨', 'Navbat aralashtirildi ⤨'],
    'toast.dir': ['Направление: {d}', 'Direction: {d}', "Yo'nalish: {d}"],
    'toast.statsCopied': ['Статистика скопирована в буфер 📋', 'Stats copied to clipboard 📋', 'Statistika buferga nusxalandi 📋'],
    'toast.copyFail': ['Не удалось скопировать', 'Could not copy', "Nusxalab bo'lmadi"],
    'btn.hard': ['Трудно', 'Hard', 'Qiyin'],
    'btn.hardTitle': ['Вспомнил с трудом — вернётся раньше', 'Recalled with effort — comes back sooner', 'Qiynalib esladim — tezroq qaytadi'],
    'btn.easy': ['Легко', 'Easy', 'Oson'],
    'btn.easyTitle': ['Слишком легко — покажем намного позже', 'Too easy — shown much later', "Juda oson — ancha keyin ko'rsatamiz"],
    'keys.grade': ['трудно / легко', 'hard / easy', 'qiyin / oson'],
    'toast.offline': ['Нет сети — работаем офлайн. Переводы догрузим, когда интернет вернётся.', 'Offline — the app keeps working. Missing translations load when you are back online.', "Internet yo'q — oflayn ishlayapmiz. Tarjimalar internet qaytganda yuklanadi."],
    'toast.online': ['Сеть снова есть 🌐', 'Back online 🌐', 'Internet qaytdi 🌐'],
    'toast.retried': [['Догрузили перевод для {n} слова', 'Догрузили переводы для {n} слов', 'Догрузили переводы для {n} слов'], ['Loaded a translation for {n} word', 'Loaded translations for {n} words'], ["{n} ta so'z tarjimasi yuklandi"]],
    'a11y.cardFront': ['Карточка: {w}. Вспомни перевод и переверни.', 'Card: {w}. Recall the translation, then flip.', 'Karta: {w}. Tarjimani esla va aylantir.'],
    'a11y.cardListen': ['Карточка на слух. Нажми S, чтобы прослушать ещё раз.', 'Listening card. Press S to hear it again.', 'Tinglash kartasi. Qayta eshitish uchun S ni bos.'],
    'a11y.cardBack': ['Карточка: {w} — {a}. Оцени, насколько легко вспомнил.', 'Card: {w} — {a}. Rate how easily you recalled it.', 'Karta: {w} — {a}. Qanchalik oson eslaganingni bahola.'],
    'a11y.revealed': ['Ответ: {a}', 'Answer: {a}', 'Javob: {a}'],
    'a11y.keys': ['Пробел — перевернуть, 1 — не помню, 2 — знал, 3 — трудно, 4 — легко, S — озвучить, H — подсказка, U — отменить.', 'Space flips, 1 don\'t know, 2 knew it, 3 hard, 4 easy, S speak, H hint, U undo.', "Probel — aylantirish, 1 — eslay olmadim, 2 — bildim, 3 — qiyin, 4 — oson, S — o'qish, H — yordam, U — bekor qilish."],
    'toast.cacheFreed': ['Память браузера была заполнена — очистили кэш переводов, прогресс сохранён.', 'Browser storage was full — cleared the translation cache, progress saved.', "Brauzer xotirasi to'lgan edi — tarjima keshi tozalandi, natija saqlandi."],
    'toast.quota': ['Память браузера заполнена: прогресс пока хранится только в этой вкладке. Скачай резервную копию в Библиотеке, чтобы ничего не потерять.', 'Browser storage is full: progress is kept only in this tab for now. Download a backup in the Library so nothing is lost.', "Brauzer xotirasi to'ldi: natija hozircha faqat shu oynada. Hech narsa yo'qolmasligi uchun Kutubxonada zaxira nusxani yuklab ol."],
    'err.badJson': ['Файл повреждён или это не JSON — библиотека не изменилась.', 'The file is damaged or not JSON — your library was not changed.', "Fayl buzilgan yoki JSON emas — kutubxona o'zgarmadi."],
    'toast.allOffline': ['Нет сети — перевести слова не получилось. Они сохранены в библиотеке и переведутся, когда интернет вернётся.', 'Offline — the words could not be translated. They are saved in the library and will be translated when you are back online.', "Internet yo'q — so'zlarni tarjima qilib bo'lmadi. Ular kutubxonada saqlandi va internet qaytganda tarjima qilinadi."],
    'toast.allFailed': ['Сервис перевода не ответил. Слова сохранены в библиотеке — попробуем ещё раз позже, или впиши переводы сам («слово - перевод»).', 'The translation service did not respond. The words are saved in the library — we will retry later, or type pairs yourself ("word - translation").', "Tarjima xizmati javob bermadi. So'zlar kutubxonada saqlandi — keyinroq yana urinamiz yoki juftliklarni o'zing yoz («so'z - tarjima»)."],
    'toast.someMissing': [['{n} слово пока без перевода — оно в библиотеке, догрузим позже.', '{n} слова пока без перевода — они в библиотеке, догрузим позже.', '{n} слов пока без перевода — они в библиотеке, догрузим позже.'], ['{n} word has no translation yet — it is in the library and will load later.', '{n} words have no translation yet — they are in the library and will load later.'], ["{n} ta so'z hozircha tarjimasiz — kutubxonada, keyinroq yuklaymiz."]],
    'toast.aiFailed': ['ИИ не ответил — перевожу бесплатным переводчиком.', 'The AI did not respond — using the free translator instead.', 'AI javob bermadi — bepul tarjimon bilan tarjima qilyapman.'],
    'mode.listen': ['🎧 На слух', '🎧 Listening', '🎧 Eshitib'],
    'listen.sub': ['слушай и напиши слово', 'listen and type the word', "tingla va so'zni yoz"],
    'listen.badge': ['аудирование', 'listening', 'tinglash'],
    'listen.ph': ['Напиши услышанное слово…', 'Type the word you heard…', "Eshitgan so'zingni yoz…"],
    'listen.noSound': ['Для режима «На слух» включи звук 🔊 (кнопка в шапке или M)', 'Turn sound on 🔊 for Listening mode (header button or M)', "«Eshitib» rejimi uchun ovozni yoq 🔊 (yuqoridagi tugma yoki M)"],
    'keys.undo': ['отменить', 'undo', 'bekor qilish'],
    'tools.undo': ['↶ Отменить', '↶ Undo', '↶ Bekor qilish'],
    'tools.undoTitle': ['Отменить последний ответ (U)', 'Undo the last answer (U)', 'Oxirgi javobni bekor qilish (U)'],
    'toast.undone': ['Ответ отменён — карточка вернулась ↶', 'Answer undone — the card is back ↶', 'Javob bekor qilindi — karta qaytdi ↶'],
    'daily.batch': ['За подход', 'Per session', 'Bir martada'],
    'daily.batchAria': ['Слов за подход', 'Words per session', "Bir martadagi so'zlar"],
    'daily.batchAll': ['все', 'all', 'hammasi'],
    'match.eyebrow': ['МИНИ-ИГРА', 'MINI GAME', "MINI O'YIN"],
    'match.title': ['Найди пару', 'Find the pair', 'Juftini top'],
    'match.sub': ['Соедини слово с переводом как можно быстрее. Колода — та же, что выбрана выше.', 'Match each word with its translation as fast as you can. Uses the deck selected above.', "So'zni tarjimasi bilan imkon qadar tez birlashtir. Yuqorida tanlangan koloda ishlatiladi."],
    'match.start': ['Играть →', 'Play →', "O'ynash →"],
    'match.restart': ['Ещё раз ↻', 'Play again ↻', 'Yana bir bor ↻'],
    'match.mistakes': [['{n} ошибка', '{n} ошибки', '{n} ошибок'], ['{n} mistake', '{n} mistakes'], ['{n} ta xato']],
    'match.best': ['рекорд {t}', 'best {t}', 'rekord {t}'],
    'match.record': ['Новый рекорд: {t} 🏆', 'New record: {t} 🏆', 'Yangi rekord: {t} 🏆'],
    'match.done': ['Все пары найдены за {t} ✓', 'All pairs found in {t} ✓', 'Barcha juftlar {t} da topildi ✓'],
    'toast.needMatch': ['Для игры нужно минимум 3 слова с разными переводами.', 'The game needs at least 3 words with different translations.', "O'yin uchun kamida 3 ta turli tarjimali so'z kerak."],
    'top.install': ['Установить приложение', 'Install the app', "Ilovani o'rnatish"],
    'toast.uiLang': ['Язык интерфейса: Русский', 'Interface language: English', "Interfeys tili: O'zbekcha"]
  };

  function rule(lang, n) {
    n = Math.abs(n);
    if (lang === 'ru') {
      var n10 = n % 10, n100 = n % 100;
      if (n10 === 1 && n100 !== 11) return 0;
      if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return 1;
      return 2;
    }
    if (lang === 'en') return n === 1 ? 0 : 1;
    return 0;
  }
  function detect() {
    try { var saved = win && win.localStorage.getItem(KEY); if (CODES.indexOf(saved) >= 0) return saved; } catch (e) {}
    var langs = (win && win.navigator && (win.navigator.languages || [win.navigator.language])) || [];
    for (var i = 0; i < langs.length; i++) {
      var c = String(langs[i] || '').slice(0, 2).toLowerCase();
      if (c === 'uz') return 'uz';
      if (c === 'ru' || c === 'uk' || c === 'be' || c === 'kk') return 'ru';
      if (c === 'en') return 'en';
    }
    return 'ru';
  }
  var lang = win ? detect() : 'ru';
  var listeners = [];

  function fill(s, vars) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] != null ? vars[k] : m; });
  }
  function pickRaw(key, l) {
    var e = D[key]; if (!e) return null;
    var v = e[CODES.indexOf(l || lang)];
    return v == null ? e[0] : v;
  }
  function t(key, vars) {
    var v = pickRaw(key);
    if (v == null) return key;
    if (Array.isArray(v)) v = v[v.length - 1];
    return fill(v, vars);
  }
  function tn(key, n, vars) {
    var v = pickRaw(key);
    if (v == null) return key;
    if (!Array.isArray(v)) return fill(v, Object.assign({ n: n }, vars));
    return fill(v[Math.min(v.length - 1, rule(lang, n))], Object.assign({ n: n }, vars));
  }
  function apply(root) {
    var doc = root || (win && win.document);
    if (!doc || typeof doc.querySelectorAll !== 'function') return;
    if (doc.documentElement) {
      doc.documentElement.lang = lang;
      doc.title = t('meta.title');
      var meta = doc.querySelector('meta[name="description"]'); if (meta) meta.setAttribute('content', t('meta.desc'));
    }
    // Only touch nodes whose text actually changes: rewriting identical markup would
    // recreate the hero heading after load and push back Largest Contentful Paint.
    doc.querySelectorAll('[data-i18n]').forEach(function (el) { var v = t(el.getAttribute('data-i18n')); if (el.textContent !== v) el.textContent = v; });
    doc.querySelectorAll('[data-i18n-html]').forEach(function (el) { var v = t(el.getAttribute('data-i18n-html')); if (el.innerHTML !== v) el.innerHTML = v; });
    doc.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var p = pair.split(':'), name = p[0].trim(), v = t(p[1].trim());
        if (el.getAttribute(name) !== v) el.setAttribute(name, v);
      });
    });
  }
  function set(code) {
    if (CODES.indexOf(code) < 0 || code === lang) return;
    lang = code;
    try { win.localStorage.setItem(KEY, code); } catch (e) {}
    apply();
    listeners.forEach(function (fn) { try { fn(code); } catch (e) {} });
  }
  return {
    codes: CODES, dict: D, t: t, tn: tn, apply: apply, set: set,
    lang: function () { return lang; },
    onChange: function (fn) { listeners.push(fn); }
  };
});
