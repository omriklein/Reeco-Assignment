using DbUp;
using Npgsql;

var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING")
    ?? throw new InvalidOperationException("CONNECTION_STRING is not set.");

var migrationsPath = Path.GetFullPath(
    Environment.GetEnvironmentVariable("MIGRATIONS_PATH")
    ?? Path.Combine(AppContext.BaseDirectory, "migrations"));

var dataPath = Path.GetFullPath(
    Environment.GetEnvironmentVariable("DATA_PATH")
    ?? Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "data"));

Console.WriteLine($"Running migrations from: {migrationsPath}");

var upgrader = DeployChanges.To
    .PostgresqlDatabase(connectionString)
    .WithScriptsFromFileSystem(migrationsPath)
    .LogToConsole()
    .Build();

var result = upgrader.PerformUpgrade();
if (!result.Successful)
{
    Console.Error.WriteLine($"Migration failed: {result.Error.Message}");
    return 1;
}

await using var conn = new NpgsqlConnection(connectionString);
await conn.OpenAsync();

await using (var check = new NpgsqlCommand("SELECT COUNT(*) FROM suppliers", conn))
{
    if ((long)(await check.ExecuteScalarAsync())! > 0)
    {
        Console.WriteLine("Data already seeded, skipping.");
        return 0;
    }
}

Console.WriteLine($"Seeding from: {dataPath}");

await SeedCategoriesAsync(conn, dataPath);
Console.WriteLine("Categories seeded.");

await SeedSuppliersAsync(conn, dataPath);
Console.WriteLine("Suppliers seeded.");

await SeedProductsAsync(conn, dataPath);
Console.WriteLine("Products seeded.");

await SeedOrdersAsync(conn, dataPath);
Console.WriteLine("Orders seeded.");

Console.WriteLine("All migrations and seeding completed successfully.");
return 0;

static async Task SeedCategoriesAsync(NpgsqlConnection conn, string dataPath)
{
    await using var tx = await conn.BeginTransactionAsync();

    await Exec(conn, tx, "CREATE TEMP TABLE categories_staging (id VARCHAR(10), name TEXT, parent_id VARCHAR(10))");

    await CopyFromCsv(conn, "COPY categories_staging FROM STDIN WITH (FORMAT CSV, NULL '')",
        Path.Combine(dataPath, "categories.csv"));

    await Exec(conn, tx, "INSERT INTO categories (id, name) SELECT id, name FROM categories_staging");

    await Exec(conn, tx, """
        UPDATE categories c
           SET parent_id = s.parent_id
          FROM categories_staging s
         WHERE c.id = s.id
           AND s.parent_id IS NOT NULL
           AND EXISTS (SELECT 1 FROM categories p WHERE p.id = s.parent_id)
        """);

    await Exec(conn, tx, "DROP TABLE categories_staging");
    await tx.CommitAsync();
}

static async Task SeedSuppliersAsync(NpgsqlConnection conn, string dataPath)
{
    await CopyFromCsv(conn,
        "COPY suppliers (id, name, email, rating, country, active, created_at) FROM STDIN WITH (FORMAT CSV, NULL '')",
        Path.Combine(dataPath, "suppliers.csv"));
}

static async Task SeedProductsAsync(NpgsqlConnection conn, string dataPath)
{
    await using var tx = await conn.BeginTransactionAsync();

    await Exec(conn, tx, "ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key");

    await Exec(conn, tx, "CREATE TEMP TABLE products_staging (id VARCHAR(10), name TEXT, category_id VARCHAR(10), sku VARCHAR(50), price DECIMAL(12,2))");

    await CopyFromCsv(conn, "COPY products_staging FROM STDIN WITH (FORMAT CSV, NULL '')",
        Path.Combine(dataPath, "products.csv"));

    await Exec(conn, tx, """
        INSERT INTO products (id, name, category_id, sku, price)
        SELECT s.id, s.name,
               CASE WHEN c.id IS NOT NULL THEN s.category_id ELSE NULL END,
               s.sku, s.price
        FROM products_staging s
        LEFT JOIN categories c ON c.id = s.category_id
        """);

    await Exec(conn, tx, "DROP TABLE products_staging");
    await tx.CommitAsync();
}

static async Task SeedOrdersAsync(NpgsqlConnection conn, string dataPath)
{
    await CopyFromCsv(conn,
        "COPY orders (id, supplier_id, product_id, quantity, unit_price, total_price, status, priority, created_at, updated_at, warehouse, notes) FROM STDIN WITH (FORMAT CSV, NULL '')",
        Path.Combine(dataPath, "orders.csv"));
}

static async Task CopyFromCsv(NpgsqlConnection conn, string copyCommand, string csvPath)
{
    await using var writer = await conn.BeginTextImportAsync(copyCommand);
    foreach (var line in File.ReadLines(csvPath).Skip(1))
        await writer.WriteLineAsync(line);
}

static async Task Exec(NpgsqlConnection conn, NpgsqlTransaction tx, string sql)
{
    await using var cmd = new NpgsqlCommand(sql, conn, tx);
    await cmd.ExecuteNonQueryAsync();
}
