BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[ItemType] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [ItemType_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ItemType_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [itemtype] NVARCHAR(1000),
    CONSTRAINT [ItemType_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Batch] (
    [id] INT NOT NULL IDENTITY(1,1),
    [itemTypeId] INT NOT NULL,
    [batchCode] NVARCHAR(1000) NOT NULL,
    [qtyReceived] INT NOT NULL,
    [qtyIssued] INT NOT NULL CONSTRAINT [Batch_qtyIssued_df] DEFAULT 0,
    [unitCost] FLOAT(53),
    [totalCost] FLOAT(53),
    [receivedAt] DATETIME2 NOT NULL,
    [notes] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Batch_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Batch_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Transaction] (
    [id] INT NOT NULL IDENTITY(1,1),
    [type] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Transaction_status_df] DEFAULT 'POSTED',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Transaction_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [itemTypeId] INT NOT NULL,
    [batchId] INT,
    [qty] INT NOT NULL,
    [unitCost] FLOAT(53),
    [totalCost] FLOAT(53),
    [unitPrice] FLOAT(53),
    [totalPrice] FLOAT(53),
    [issuedToType] NVARCHAR(1000),
    [issuedToName] NVARCHAR(1000),
    [createdById] INT NOT NULL,
    [notes] NVARCHAR(1000),
    CONSTRAINT [Transaction_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Attachment] (
    [id] INT NOT NULL IDENTITY(1,1),
    [transactionId] INT NOT NULL,
    [fileName] NVARCHAR(1000) NOT NULL,
    [mimeType] NVARCHAR(1000),
    [size] INT,
    [path] NVARCHAR(1000) NOT NULL,
    [uploadedAt] DATETIME2 NOT NULL CONSTRAINT [Attachment_uploadedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [uploadedById] INT NOT NULL,
    CONSTRAINT [Attachment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Transaction_itemTypeId_idx] ON [dbo].[Transaction]([itemTypeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Transaction_batchId_idx] ON [dbo].[Transaction]([batchId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Transaction_createdById_idx] ON [dbo].[Transaction]([createdById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Transaction_type_idx] ON [dbo].[Transaction]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Transaction_status_idx] ON [dbo].[Transaction]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Transaction_issuedToType_idx] ON [dbo].[Transaction]([issuedToType]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Attachment_transactionId_idx] ON [dbo].[Attachment]([transactionId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Attachment_uploadedById_idx] ON [dbo].[Attachment]([uploadedById]);

-- AddForeignKey
ALTER TABLE [dbo].[Batch] ADD CONSTRAINT [Batch_itemTypeId_fkey] FOREIGN KEY ([itemTypeId]) REFERENCES [dbo].[ItemType]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Transaction] ADD CONSTRAINT [Transaction_itemTypeId_fkey] FOREIGN KEY ([itemTypeId]) REFERENCES [dbo].[ItemType]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Transaction] ADD CONSTRAINT [Transaction_batchId_fkey] FOREIGN KEY ([batchId]) REFERENCES [dbo].[Batch]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Transaction] ADD CONSTRAINT [Transaction_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Attachment] ADD CONSTRAINT [Attachment_transactionId_fkey] FOREIGN KEY ([transactionId]) REFERENCES [dbo].[Transaction]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Attachment] ADD CONSTRAINT [Attachment_uploadedById_fkey] FOREIGN KEY ([uploadedById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
