using DbUp;

var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING")
    ?? throw new InvalidOperationException("CONNECTION_STRING environment variable is not set.");

var migrationsPath = Path.GetFullPath(
    Environment.GetEnvironmentVariable("MIGRATIONS_PATH")
    ?? Path.Combine(AppContext.BaseDirectory, "migrations"));

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

Console.WriteLine("All migrations applied successfully.");
return 0;
