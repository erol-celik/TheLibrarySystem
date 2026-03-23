import random
from datetime import datetime, timedelta
from faker import Faker

# --- CONFIGURATION ---
NUM_USERS = 24        
# NUM_BOOKS aşağıda dinamik olarak ayarlanacak (Listenin uzunluğuna göre)
NUM_RENTALS = 80
NUM_REVIEWS = 80
NUM_TRANSACTIONS = 70
NUM_DONATIONS = 20
NUM_SALES = 20
NUM_FEEDBACKS = 15
NUM_NOTIFICATIONS = 60

PLAIN_PASSWORD = "123"

fake = Faker(['en_US'])
Faker.seed(42)
random.seed(42)

f = open("data.sql", "w", encoding="utf-8")

# --- MEMORY ---
books_registry = []  
late_returners = set() 
donors = {} 

def escape(text):
    if text is None: return "NULL"
    return str(text).replace("'", "''").replace("\n", " ")

def get_now():
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

print("🚀 Script Started: UNIQUE CLASSICS ONLY Mode...")

f.write("SET FOREIGN_KEY_CHECKS = 0;\n\n")

# ==========================================
# 1. CATEGORIES & TAGS
# ==========================================
categories = [
    "Science Fiction", "History", "Romance", "Self Help", "Software", 
    "Philosophy", "Psychology", "Crime", "Biography", "Children", 
    "Fantasy", "Mystery", "Literature", "Classics"
]

for i, cat in enumerate(categories, 1):
    f.write(f"INSERT IGNORE INTO categories (id, created_at, updated_at, name) VALUES ({i}, '{get_now()}', '{get_now()}', '{escape(cat)}');\n")
    
tags = [
    "Thrilling", "Emotional", "Dark", "Educational", "Funny", 
    "Short Read", "Masterpiece", "Dystopian", "Classic", "Fast-Paced"
]

tag_ids = []
for i, tag in enumerate(tags, 1):
    f.write(f"INSERT IGNORE INTO tags (id, created_at, updated_at, name) VALUES ({i}, '{get_now()}', '{get_now()}', '{escape(tag)}');\n")
    tag_ids.append(i)

# ==========================================
# 2. USERS & ROLES
# ==========================================
user_ids = list(range(1, NUM_USERS + 1))
regular_user_ids = [] 

for i in user_ids:
    email = f"user{i}@library.com"
    name = fake.name()
    bio = fake.text(max_nb_chars=80)
    avatar = f"https://api.dicebear.com/7.x/avataaars/svg?seed={i}"
    phone = fake.phone_number()
    address = fake.address()
    
    if i <= 2: 
        role_enum = "ADMIN"
        if i == 1: email = "admin@library.com"
        if i == 2: email = "staff@library.com"
    elif i <= 4: 
        role_enum = "LIBRARIAN"
    else: 
        role_enum = "USER"
        regular_user_ids.append(i)

    sql = (f"INSERT IGNORE INTO users (id, created_at, updated_at, email, password, name, is_banned, "
           f"avatar_url, bio, phone_number, address) VALUES ({i}, '{get_now()}', '{get_now()}', "
           f"'{email}', '{PLAIN_PASSWORD}', '{escape(name)}', 0, '{avatar}', '{escape(bio)}', '{escape(phone)}', '{escape(address)}');\n")
    f.write(sql)
    
    f.write(f"INSERT IGNORE INTO user_roles (user_id, role) VALUES ({i}, '{role_enum}');\n")
    
    if role_enum == "USER":
        balance = round(random.uniform(0, 150), 2)
        f.write(f"INSERT IGNORE INTO wallet (wallet_id, user_id, balance) VALUES ({i}, {i}, {balance});\n")

# ==========================================
# 3. BOOKS (UNIQUE COLLECTION)
# ==========================================
print("📚 Books (Generating Unique Collection)...")

# Format: (Title, Author, CoverURL)
real_books = [
    ("Crime and Punishment", "Fyodor Dostoevsky", "https://covers.openlibrary.org/b/id/8259443-L.jpg"),
    ("Les Misérables", "Victor Hugo", "https://covers.openlibrary.org/b/id/8389339-L.jpg"),
    ("1984", "George Orwell", "https://covers.openlibrary.org/b/id/7222246-L.jpg"),
    ("Animal Farm", "George Orwell", "https://covers.openlibrary.org/b/id/10561234-L.jpg"),
    ("The Little Prince", "Antoine de Saint-Exupéry", "https://covers.openlibrary.org/b/id/8363294-L.jpg"),
    ("The Metamorphosis", "Franz Kafka", "https://covers.openlibrary.org/b/id/12539659-L.jpg"),
    ("The Stranger", "Albert Camus", "https://covers.openlibrary.org/b/id/6447781-L.jpg"),
    ("The Alchemist", "Paulo Coelho", "https://covers.openlibrary.org/b/id/8573229-L.jpg"),
    ("White Fang", "Jack London", "https://covers.openlibrary.org/b/id/2953531-L.jpg"),
    ("Pride and Prejudice", "Jane Austen", "https://covers.openlibrary.org/b/id/8259286-L.jpg"),
    ("Wuthering Heights", "Emily Bronte", "https://covers.openlibrary.org/b/id/8259445-L.jpg"),
    ("Of Mice and Men", "John Steinbeck", "https://covers.openlibrary.org/b/id/6406535-L.jpg"),
    ("To Kill a Mockingbird", "Harper Lee", "https://covers.openlibrary.org/b/id/8259392-L.jpg"),
    ("The Great Gatsby", "F. Scott Fitzgerald", "https://covers.openlibrary.org/b/id/8432047-L.jpg"),
    ("The Catcher in the Rye", "J.D. Salinger", "https://covers.openlibrary.org/b/id/8259399-L.jpg"),
    ("War and Peace", "Leo Tolstoy", "https://covers.openlibrary.org/b/id/10530759-L.jpg"),
    ("Anna Karenina", "Leo Tolstoy", "https://covers.openlibrary.org/b/id/10543797-L.jpg"),
    ("Madame Bovary", "Gustave Flaubert", "https://covers.openlibrary.org/b/id/12666578-L.jpg"),
    ("A Tale of Two Cities", "Charles Dickens", "https://covers.openlibrary.org/b/id/7350787-L.jpg"),
    ("Moby Dick", "Herman Melville", "https://covers.openlibrary.org/b/id/7222238-L.jpg"),
    ("Robinson Crusoe", "Daniel Defoe", "https://covers.openlibrary.org/b/id/8259296-L.jpg"),
    ("Don Quixote", "Miguel de Cervantes", "https://covers.openlibrary.org/b/id/8259363-L.jpg"),
    ("The Divine Comedy", "Dante Alighieri", "https://covers.openlibrary.org/b/id/8259397-L.jpg"),
    ("Faust", "Johann Wolfgang von Goethe", "https://covers.openlibrary.org/b/id/8259374-L.jpg"),
    ("The Trial", "Franz Kafka", "https://covers.openlibrary.org/b/id/10582846-L.jpg"),
    ("Brave New World", "Aldous Huxley", "https://covers.openlibrary.org/b/id/8259336-L.jpg"),
    ("Fahrenheit 451", "Ray Bradbury", "https://covers.openlibrary.org/b/id/8259367-L.jpg"),
    ("A Clockwork Orange", "Anthony Burgess", "https://covers.openlibrary.org/b/id/10521636-L.jpg"),
    ("The Lord of the Rings", "J.R.R. Tolkien", "https://covers.openlibrary.org/b/id/8381831-L.jpg"),
    ("Harry Potter and the Sorcerer's Stone", "J.K. Rowling", "https://covers.openlibrary.org/b/id/10580436-L.jpg"),
    ("The Da Vinci Code", "Dan Brown", "https://covers.openlibrary.org/b/id/8061993-L.jpg"),
    ("The Kite Runner", "Khaled Hosseini", "https://covers.openlibrary.org/b/id/8259424-L.jpg"),
    ("Sophie's World", "Jostein Gaarder", "https://covers.openlibrary.org/b/id/7550186-L.jpg"),
    ("The Name of the Rose", "Umberto Eco", "https://covers.openlibrary.org/b/id/8259333-L.jpg"),
    ("Great Expectations", "Charles Dickens", "https://covers.openlibrary.org/b/id/8259409-L.jpg"),
    ("Jane Eyre", "Charlotte Bronte", "https://covers.openlibrary.org/b/id/8259288-L.jpg"),
    ("The Picture of Dorian Gray", "Oscar Wilde", "https://covers.openlibrary.org/b/id/8259317-L.jpg"),
    ("Frankenstein", "Mary Shelley", "https://covers.openlibrary.org/b/id/8259419-L.jpg"),
    ("Dracula", "Bram Stoker", "https://covers.openlibrary.org/b/id/8259306-L.jpg"),
    ("The Odyssey", "Homer", "https://covers.openlibrary.org/b/id/8259311-L.jpg"),
    ("The Iliad", "Homer", "https://covers.openlibrary.org/b/id/8259438-L.jpg"),
    ("Ulysses", "James Joyce", "https://covers.openlibrary.org/b/id/8259325-L.jpg"),
    ("The Old Man and the Sea", "Ernest Hemingway", "https://covers.openlibrary.org/b/id/8259388-L.jpg"),
    ("Sherlock Holmes", "Arthur Conan Doyle", "https://covers.openlibrary.org/b/id/10360706-L.jpg"),
    ("Romeo and Juliet", "William Shakespeare", "https://covers.openlibrary.org/b/id/8259318-L.jpg"),
    ("Hamlet", "William Shakespeare", "https://covers.openlibrary.org/b/id/8259423-L.jpg"),
    ("Macbeth", "William Shakespeare", "https://covers.openlibrary.org/b/id/8259313-L.jpg"),
    ("The Hobbit", "J.R.R. Tolkien", "https://covers.openlibrary.org/b/id/8381867-L.jpg"),
    ("Dune", "Frank Herbert", "https://covers.openlibrary.org/b/id/9267455-L.jpg"),
    ("The Hunger Games", "Suzanne Collins", "https://covers.openlibrary.org/b/id/12557169-L.jpg"),
    ("Twilight", "Stephenie Meyer", "https://covers.openlibrary.org/b/id/12521941-L.jpg"),
    ("Game of Thrones", "George R.R. Martin", "https://covers.openlibrary.org/b/id/8350619-L.jpg")
]

# BURASI ÖNEMLİ: Kitap sayısını listenin uzunluğuna sabitliyoruz.
NUM_BOOKS = len(real_books)
print(f"📚 Generating exactly {NUM_BOOKS} unique books...")

book_ids = list(range(1, NUM_BOOKS + 1))
book_types = ["PHYSICAL", "DIGITAL", "HYBRID"]
cat_ids_pool = list(range(1, len(categories) + 1))

for i in book_ids:
    # Artık modulo'ya gerek yok, sırayla alıyoruz
    real_title, real_author, real_image_url = real_books[i - 1]
    
    title = real_title
    author = real_author
    publisher = fake.company()
    description = fake.paragraph(nb_sentences=4)
    
    isbn = f"978-0-{i:09d}-X"
    
    b_type = random.choice(book_types)
    price = round(random.uniform(15, 85), 2)
    
    books_registry.append({
        "id": i,
        "title": title,
        "author": author,
        "price": price
    })
    
    rental_status = "AVAILABLE" 
    is_pick = 1 if random.random() < 0.1 else 0

    sql = (f"INSERT IGNORE INTO books (id, created_at, updated_at, title, author, isbn, publisher, "
           f"publication_year, page_count, description, price, book_type, total_stock, "
           f"available_stock, is_active, is_editors_pick, rental_status, image_url) VALUES "
           f"({i}, '{get_now()}', '{get_now()}', '{escape(title)}', '{escape(author)}', '{isbn}', '{escape(publisher)}', "
           f"{random.randint(1900, 2023)}, {random.randint(100, 900)}, '{escape(description)}', "
           f"{price}, '{b_type}', 10, "
           f"10, 1, {is_pick}, '{rental_status}', '{real_image_url}');\n")
    f.write(sql)
    
    # Random categories
    selected_cats = random.sample(cat_ids_pool, k=random.randint(1, 2))
    for cat_id in selected_cats:
        f.write(f"INSERT IGNORE INTO book_categories (book_id, category_id) VALUES ({i}, {cat_id});\n")

    selected_tags = random.sample(tag_ids, k=random.randint(1, 3))
    for tag_id in selected_tags:
        f.write(f"INSERT IGNORE INTO book_tags (book_id, tag_id) VALUES ({i}, {tag_id});\n")

# ==========================================
# 4. RENTALS
# ==========================================
print("🤝 Rentals...")
for i in range(1, NUM_RENTALS + 1):
    if not regular_user_ids: break
    u_id = random.choice(regular_user_ids)
    b_data = random.choice(books_registry)
    b_id = b_data["id"]
    
    rent_date = datetime.now() - timedelta(days=random.randint(0, 60))
    due_date = rent_date + timedelta(days=14)
    
    rand = random.random()
    penalty = 0
    return_date_sql = "NULL"
    status = "APPROVED"
    
    if rand < 0.10: status = "REQUESTED"
    elif rand < 0.20: status = "REJECTED"
    elif rand < 0.70:
        status = "RETURNED"
        ret_date = rent_date + timedelta(days=random.randint(1, 20))
        return_date_sql = f"'{ret_date.strftime('%Y-%m-%d')}'"
        if ret_date > due_date: 
            penalty = (ret_date - due_date).days * 2.0 
            late_returners.add(u_id) 
    else:
        if datetime.now() > due_date:
            status = "LATE"
            late_returners.add(u_id) 
        else:
            status = "APPROVED"

    sql = (f"INSERT IGNORE INTO rentals (id, created_at, updated_at, user_id, book_id, rent_date, "
           f"due_date, return_date, status, penalty_fee) VALUES "
           f"({i}, '{rent_date}', '{rent_date}', {u_id}, {b_id}, "
           f"'{rent_date.date()}', '{due_date.date()}', {return_date_sql}, '{status}', {penalty});\n")
    f.write(sql)

# ==========================================
# 5. REVIEWS
# ==========================================
print("⭐ Reviews...")
review_pairs = set()
count = 0
while count < NUM_REVIEWS:
    u, b_data = random.choice(regular_user_ids), random.choice(books_registry)
    b = b_data["id"]
    if (u, b) not in review_pairs:
        review_pairs.add((u, b))
        count += 1
        comment = fake.sentence(nb_words=12)
        is_spoiler = 1 if random.random() < 0.1 else 0
        f.write(f"INSERT IGNORE INTO reviews (id, created_at, updated_at, user_id, book_id, stars, comment, is_spoiler, helpful_count) VALUES ({count}, '{get_now()}', '{get_now()}', {u}, {b}, {random.randint(3, 5)}, '{escape(comment)}', {is_spoiler}, {random.randint(0, 50)});\n")
        
        if random.random() < 0.3:
            liker = random.choice(regular_user_ids)
            if liker != u:
                f.write(f"INSERT IGNORE INTO review_likes (id, created_at, updated_at, user_id, review_id) VALUES ({count}, '{get_now()}', '{get_now()}', {liker}, {count});\n")

# ==========================================
# 6. TRANSACTIONS & SALES
# ==========================================
print("💸 Transactions & Sales...")
for i in range(1, NUM_TRANSACTIONS + 1):
    if not regular_user_ids: break 
    w_id = random.choice(regular_user_ids) 
    t_type = random.choice(['PURCHASE', 'PENALTY_PAYMENT', 'DONATION'])
    amount = round(random.uniform(2, 25), 2)
    f.write(f"INSERT IGNORE INTO wallet_transactions (id, created_at, updated_at, wallet_id, transaction_type, amount) VALUES ({i}, '{get_now()}', '{get_now()}', {w_id}, '{t_type}', {amount});\n")

for i in range(1, NUM_SALES + 1):
    u_id = random.choice(regular_user_ids)
    sold_book = random.choice(books_registry)
    sale_type = random.choice(['PHYSICAL_COPY', 'DIGITAL_COPY'])
    f.write(f"INSERT IGNORE INTO book_sales (id, created_at, updated_at, user_id, book_id, book_sale_type, sold_price) VALUES ({i}, '{get_now()}', '{get_now()}', {u_id}, {sold_book['id']}, '{sale_type}', {sold_book['price']});\n")

# ==========================================
# 7. EXTRAS
# ==========================================
print("🎁 Extras...")

for i in range(1, NUM_DONATIONS + 1):
    u_id = random.choice(regular_user_ids)
    d_status = random.choice(['PENDING', 'APPROVED', 'REJECTED'])
    
    if d_status == 'APPROVED':
        existing_book = random.choice(books_registry)
        d_title = existing_book['title']
        d_author = existing_book['author']
    else:
        d_title = fake.catch_phrase().title()
        d_author = fake.name()
    
    donors[u_id] = {'title': d_title, 'status': d_status}

    f.write(f"INSERT IGNORE INTO donations (id, created_at, updated_at, user_id, book_title, book_author, status) VALUES ({i}, '{get_now()}', '{get_now()}', {u_id}, '{escape(d_title)}', '{escape(d_author)}', '{d_status}');\n")

for i in range(1, 21):
    u_id = random.choice(regular_user_ids)
    s_status = random.choice(['PENDING', 'APPROVED', 'REJECTED'])
    f.write(f"INSERT IGNORE INTO book_suggestions (id, created_at, updated_at, suggester_user_id, title, author, status) VALUES ({i}, '{get_now()}', '{get_now()}', {u_id}, '{escape(fake.catch_phrase())}', '{escape(fake.name())}', '{s_status}');\n")

for i in range(1, NUM_FEEDBACKS + 1):
    u_id = random.choice(regular_user_ids)
    f_type = random.choice(['COMPLAINT', 'SUGGESTION'])
    f_status = random.choice(['NEW', 'IN_PROGRESS', 'RESOLVED'])
    msg = fake.sentence(nb_words=10)
    f.write(f"INSERT IGNORE INTO feedbacks (id, created_at, updated_at, user_id, feedback_type, message, feedback_status) VALUES ({i}, '{get_now()}', '{get_now()}', {u_id}, '{f_type}', '{escape(msg)}', '{f_status}');\n")

notif_id = 1
for recipient in regular_user_ids:
    num_msgs = random.randint(1, 3)
    for _ in range(num_msgs):
        sender = 1 
        is_read = 1 if random.random() < 0.5 else 0
        raw_message = ""
        
        scenario = random.random()
        
        if recipient in late_returners and scenario < 0.4:
            raw_message = "⚠️ Warning: You have overdue books. Please return them to avoid account suspension."
        
        elif recipient in donors and scenario < 0.7:
            d_info = donors[recipient]
            if d_info['status'] == 'APPROVED':
                raw_message = f"🎉 Good news! Your donation '{d_info['title']}' has been added to our library collection."
            elif d_info['status'] == 'REJECTED':
                raw_message = f"Regarding your donation '{d_info['title']}': We currently cannot accept this item."
            else:
                raw_message = f"Your donation '{d_info['title']}' is currently being reviewed by our librarians."
        
        else:
            random_book = random.choice(books_registry)
            types = [
                f"Reminder: The book '{random_book['title']}' is due in 3 days.",
                f"Receipt: You successfully purchased '{random_book['title']}' for ${random_book['price']}.",
                "System: Your wallet balance has been updated.",
                "Library News: We will be closed this Sunday for maintenance."
            ]
            raw_message = random.choice(types)

        final_message = escape(raw_message)
        f.write(f"INSERT IGNORE INTO notifications (id, created_at, updated_at, recipient_user_id, sender_user_id, message, is_read) VALUES ({notif_id}, '{get_now()}', '{get_now()}', {recipient}, {sender}, '{final_message}', {is_read});\n")
        notif_id += 1

f.write("\nSET FOREIGN_KEY_CHECKS = 1;\n")
f.close()

print("✅ DONE: data.sql generated (Unique Collection Mode).")