export const CONFIG = {
    PLAYER: {
        MOVE_SPEED: 10,
        JUMP_FORCE: 12,
        GROUND_LEVEL: 0,
    },
    WORLD: {
        SIZE: 150,
        TREE_COUNT: 100,
        GARBAGE_COUNT: 60,
        NPC_COUNT: 3, 
        BUILDING_COUNT: 12,
        FACTORY_COUNT: 4,
        MOUNTAIN_COUNT: 10,
        ANIMAL_COUNT: 15,
        LOGGERS_COUNT: 6,
        PREDATORS_COUNT: 4,
        FISH_COUNT: 15,
        ARTIFACT_COUNT: 1
    },
    STORIES: [
        {
            name: "Элара, Орон гэргүй",
            story: "Миний гэр бүл энэ ойд олон үеэрээ амьдарч ирсэн. Гэвч агаар бохирдож, халуун нэмэгдэхэд үйлдвэрийн оч ганцхан үсрэхэд л бидний гэр орон галд автсан. Би тэр шөнө бүх зүйлээ алдсан. Одоо би энэ нурман дунд тэнүүчилж, хэн нэгэн энэ хог хаягдлыг цэвэрлээсэй гэж найдаж сууна. Хэрэв та байшингийн ойролцоо хог олвол түүж өгөөч. Энэ бол дэлхийг хөргөх цорын ганц арга юм.",
            quest: { title: "Хог Цэвэрлэгээ", description: "5 ширхэг хог цуглуул.", type: "garbage", target: 5, reward: 150 }
        },
        {
            name: "Каел, Гэмшсэн Хүн",
            story: "Би өмнө нь энэ хөндийн хамгийн шилдэг анчин байлаа. Шуналдаа хөтлөгдөж, хар захын өндөр үнэд хууртаж байгаль дэлхийгээ хайрлаагүй. Гэтэл одоо хараач... амьтад үхэж, ой мод нил чимээгүй. Би хийсэн үйлдэл болгондоо харамсаж байна. Хэрэв та туслахыг хүсвэл ойн гүнд байгаа хууль бус мод бэлтгэгчдийг зогсоож өгөөч.",
            quest: { title: "Ой Хамгаалалт", description: "2 хууль бус мод бэлтгэгчийг ял.", type: "logger", target: 2, reward: 250 }
        },
        {
            name: "Доктор Арис, Архивын ажилтан",
            story: "Миний мэдрэгчүүд хэдхэн минутын дараа гараг бүрэн сүйрнэ гэж зааж байна. Энэ бол зүгээр нэг бохирдол биш, экосистемийн сүйрэл юм. Баруун хойд зүгт 'Эртний Технологи' нуугдаж байдаг гэсэн домог бий. Тэр олдвор агаар мандлыг дахин тогтворжуулж чадна. Би дэндүү хөгширсөн тул очиж чадахгүй байна. Та тэр олдворыг олж чадвал биднийг аварч магадгүй юм.",
            quest: { title: "Тогтворжуулагч", description: "Эртний олдворыг ол.", type: "artifact", target: 1, reward: 500 }
        }
    ],
    MISSION: {
        NATURE_SCORE_TARGET: 250,
        COLLAPSE_TIMER: 600
    },
    WEATHER: {
        FIRE_CHANCE: 0.0003,
        RAIN_CHANCE: 0.0006,
        FIRE_DAMAGE: 5,
        RAIN_HEAL_RATE: 0.2
    },
    REPUTATION: {
        ANGRY_THRESHOLD: -25,
        FRIENDLY_THRESHOLD: 25,
        TRUST_THRESHOLD: 60
    },
    STATS: {
        MAX_OXYGEN: 100,
        MAX_HEALTH: 100,
        OXYGEN_DECAY_PER_TREE: 8,
        OXYGEN_GAIN_PER_GARBAGE: 6,
        MONEY_GAIN_PER_GARBAGE: 10,
        SORTING_BONUS: 15,
        ANIMAL_REWARD: 50,
        REPUTATION_GAIN_GARBAGE: 3,
        REPUTATION_LOSS_TREE: -1,
        WOOD_GAIN_TREE: 5,
        REPUTATION_LOSS_HUNT: -4,
        REPUTATION_GAIN_LOGGER: 20,
        BASE_FIRE_RATE: 1.0, 
        FIRE_RATE_MODIFIER: 0.008, 
        CRITICAL_OXYGEN: 20,
        BURN_DAMAGE_RATE: 15,
        BASE_REACH: 4.0,
        BASE_DURABILITY: 20,
        BASE_MOVE_SPEED: 10,
        ENEMY_HEALTH_LOGGER: 2,
        ENEMY_HEALTH_PREDATOR: 3,
        UPGRADE_COSTS: {
            REACH: { wood: 10, money: 100 },
            DURABILITY: { wood: 5, money: 50 },
            SPEED: { wood: 8, money: 80 },
            EFFICIENCY: { wood: 15, money: 150 },
            HUNTING_GEAR: { wood: 20, money: 200 }
        }
    },
    COLORS: {
        GROUND: 0x3d5a3d,
        TREE_TRUNK: 0x8b4513,
        TREE_LEAVES: 0x228b22,
        GARBAGE: 0x888888,
        SKY_CLEAN: 0x87ceeb,
        SKY_POLLUTED: 0x4a4a4a,
        NPC: 0xffcc00,
        MOUNTAIN: 0x666666,
        BUILDING: 0xcccccc,
        FACTORY: 0x555555,
        LAKE: 0x0044ff,
        ANIMAL: 0xaa6644
    }
};
