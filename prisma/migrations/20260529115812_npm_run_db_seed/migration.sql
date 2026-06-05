-- CreateTable
CREATE TABLE `dictionary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lampung_word` VARCHAR(255) NOT NULL,
    `indonesia_word` VARCHAR(255) NOT NULL,
    `dialect` VARCHAR(50) NOT NULL DEFAULT 'Api',
    `category` VARCHAR(100) NOT NULL DEFAULT 'Nomina',
    `example_sentence` TEXT NULL,
    `example_meaning` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `dictionary_lampung_word_idx`(`lampung_word`),
    INDEX `dictionary_indonesia_word_idx`(`indonesia_word`),
    INDEX `dictionary_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `translation_history` (
    `id` VARCHAR(191) NOT NULL,
    `input_text` TEXT NOT NULL,
    `translated_text` TEXT NOT NULL,
    `simplified_text` TEXT NULL,
    `direction` VARCHAR(100) NOT NULL DEFAULT 'lampung_to_indonesia',
    `nlp_steps` JSON NOT NULL,
    `processing_time` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `translation_history_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simplification_history` (
    `id` VARCHAR(191) NOT NULL,
    `formal_text` TEXT NOT NULL,
    `simplified_text` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `simplification_history_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_username_key`(`username`),
    UNIQUE INDEX `admin_email_key`(`email`),
    INDEX `admin_email_idx`(`email`),
    INDEX `admin_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
