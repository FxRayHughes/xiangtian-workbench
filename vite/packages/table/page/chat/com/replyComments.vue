<template>
    <div class="flex items-center justify-between w-full mt-2">
        <a-avatar :src="userInfo.avatar" :size="32" class="pointer" @click.stop="showCard(uid, Info)"></a-avatar>
        <!-- <div class="w-full ml-3 "> -->
        <a-input v-model:value="value" :placeholder="replyPlaceholder" class=" xt-bg comment-input btn" bordered="false" style="cursor: default;"
            @keyup.enter="addComment" />
        <!-- </div> -->
    </div>
    <div class="clearfix mt-3 ml-11" v-if="imageVis">
        <a-upload v-model:file-list="fileList" list-type="picture-card" @preview="handlePreview" multiple>
            <div v-if="fileList.length < 3">
                <plus-outlined style="font-size: 20px;" />
            </div>
        </a-upload>
        <a-modal v-model:visible="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
            <img style="width: 100%" :src="previewImage" />
        </a-modal>
    </div>
    <div class="flex justify-between w-full mt-2 mb-4 font-14 input-btm">
        <div class="w-full">
            <tippy trigger=" click" placement="bottom" :interactive="true">
                <template #content>
                    <!-- <div class="w-full"> -->
                    <vue-custom-scrollbar :settings="settingsScroller" class="w-full h-[150px] xt-bg-2 rounded-lg flex  "
                        style="flex-wrap: wrap;">
                        <div v-for="(item, index) in folderPath" class="mb-2 ml-1 mr-1  pointer w-[32px] h-[32px]"
                            @click="addEmoji(item)" :key="index" style="cursor: pointer;">
                            <img :src="item" class="w-[32px] h-[32px]">
                        </div>
                    </vue-custom-scrollbar>
                    <!-- </div> -->
                </template>
                <button class=" w-[68px] h-[32px]  xt-text-2 ml-9 xt-bg-2 rounded-lg"
                    style="color: var(--secondary-text) !important; text-align: center !important; border: none;">
                    <SmileOutlined style="font-size: 16px !important; margin-right: 4px;" />
                </button>
            </tippy>
            <button class="w-[68px] h-[32px] xt-text-2 xt-bg-2 rounded-lg ml-1"
                style="color: var(--secondary-text) !important; text-align: center !important; border: none;"
                @click="imageVisible">
                <PictureOutlined style="font-size: 16px !important; margin-right: 4px;" />
            </button>
        </div>
        <xt-button type="primary" class=" reply xt-text"
            style="color: var(--secondary-text) !important; border-radius: 8px;width: 68px; height: 32px;background: var(--active-bg) !important;"
            @click="addComment">回复</xt-button>
    </div>
    <!-- <tippy trigger="mouseenter click" placement="bottom">

    </tippy> -->
</template>

<script setup lang='ts'>
import { ref, reactive, computed, onMounted } from 'vue'
import { SmileOutlined, PictureOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { appStore } from '../../../../table/store'
import { fileUpload } from '../../../components/card/hooks/imageProcessing'
import { useCommunityStore } from '../commun'
const useCommunStore = useCommunityStore()
const userStore = appStore()
const value = ref('')
const commentList = ref([])
const props = defineProps({
    replyCom: {
        type: Object,
        default: () => []
    }
})
// const emojiVis = ref(false)
const replyPlaceholder = computed(() => {
    return `回复${props.replyCom.user.nickname}`
})
const imageVis = ref(false)
// 添加表情
const addEmoji = (item) => {
    const lastSlashIndex = item.lastIndexOf('/');
    const emoiiValue = item.substring(lastSlashIndex + 1);
    // console.log(emoiiValue);

    const key = Object.entries(fluentEmojis).find(([k, v]) => v === (emoiiValue))[0]
    value.value += `${key}`

}
const fileList = ref<UploadProps['fileList']>([]);
const emit = defineEmits(['addComment'])
const addComment = async () => {
    if (value.value || fileList.value.length > 0) {
        const imageUrlList = await Promise.all(fileList.value.map(async (item) => {
            const url = await fileUpload(item.originFileObj);
            return url;
        }));
        // console.log(imageUrlList.value, 'imageurl')
        // console.log(props.replyCom,'props');

        let authorid: number = props.replyCom.to_reply_uid === 0 ? props.replyCom.author_uid : props.replyCom.to_reply_uid
        let content: string = value.value
        let threadId: number = useCommunStore.communityPostDetail.pay_set.tid ? useCommunStore.communityPostDetail.pay_set.tid : useCommunStore.communityPostDetail.id
        // let imageList:Array<string>=imageUrlList.value
        let to_reply_id = props.replyCom.to_reply_id === 0 ? props.replyCom.id : props.replyCom.to_reply_id
        let to_reply_second_id = props.replyCom.to_reply_second_id === 0 ? props.replyCom.id : props.replyCom.to_reply_id
        // console.log(JSON.stringify(imageUrlList.value), 'image');
        // console.log(props.replyCom.to_reply_id,props.replyCom.id);
        setTimeout(async () => {
            const imageList = JSON.stringify(imageUrlList);
            await useCommunStore.getCommunitythreadReply(authorid, content, threadId,imageList, to_reply_id, to_reply_second_id)
            await useCommunStore.getCommunityPostDetail(threadId)
            await useCommunStore.getCommunityPostReply(threadId)
            value.value = ''
            fileList.value = []
        })

        // console.log(props.replyCom);


    }
    emit('addComment', commentList)
}
const imageVisible = () => {
    imageVis.value = !imageVis.value
}
import type { UploadProps } from 'ant-design-vue';

function getBase64(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const settingsScroller = reactive({
    useBothWheelAxes: true,
    swipeEasing: true,
    suppressScrollY: false,
    suppressScrollX: true,
    wheelPropagation: true,
});
const fluentEmojis = reactive({
    "[Kiss]": "Face Blowing a Kiss.png",
    "[Tears]": "Face with Tears of Joy.png",
    "[Cry]": "Loudly Crying Face.png",
    "[Smiling]": "Smiling Face with Open Hands.png",
    "[Confound]": "Confounded Face.png",
    "[Mask]": "Face with Medical Mask.png",
    "[Zany]": "Zany Face.png",
    "[Vomit]": "Face Vomiting.png",
    "[Kissing]": "Kissing Face.png",
    "[Fearful]": "Fearful Face.png",
    "[Pleading]": "Pleading Face.png",
    "[Scream]": "Face Screaming in Fear.png",
    "[AngryFace]": "Angry Face.png",
    "[Zipper]": "Zipper-Mouth Face.png",
    "[Expressionless]": "Expressionless Face.png",
    "[SpiralEyes]": "Face with Spiral Eyes.png",
    "[Shushing]": "Shushing Face.png",
    "[MoneyMouth]": "Money-Mouth Face.png",
    "[ThumbsUp]": "Thumbs Up Light Skin Tone.png",
    "[ThumbsDown]": "Thumbs Down Light Skin Tone.png",
    "[Victory]": "Victory Hand Light Skin Tone.png",
    "[Ok]": "OK Hand Light Skin Tone.png",
    "[Pingching]": "Pinching Hand Light Skin Tone.png",
    "[Hands]": "Folded Hands Light Skin Tone.png",
    "[Clap]": "Clapping Hands Light Skin Tone.png",
    "[OpenHands]": "Open Hands Light Skin Tone.png",
    "[Waing]": "Waving Hand Light Skin Tone.png",
    "[Writing]": "Writing Hand Light Skin Tone.png",
    "[PigFace]": "Pig Face.png",
    "[Cat]": "Cat with Wry Smile.png",
    "[Blowfish]": "Blowfish.png",
    "[Yen]": "Yen Banknote.png",
    "[Triangular]": "Triangular Flag.png",
    "[Heart]": "Beating Heart.png",
    "[Broken]": "Broken Heart.png",
    "[1st]": "1st Place Medal.png",
    "[2nd]": "2nd Place Medal.png",
    "[3rd]": "3rd Place Medal.png",
    "[Selfie]": "Selfie Light Skin Tone.png",
    "[Teacup]": "Teacup Without Handle.png",
    "[New]": "New Button.png",
    "[Check]": "Check Mark Button.png",
    "[Anger]": "Anger Symbol.png",
    "[Acceptable]": 'Japanese Acceptable Button.png',
    "[Hundred]": "Hundred Points.png",
    "[Crab]": "Crab.png",
    "[MoneyBag]": "Money Bag.png",
    "[Zzz]": "Zzz.png",
    "[Bomb]": "Bomb.png",
})
// 用于在动态和评论中使用的表情
// str.replace(/\[([^(\]|\[)]*)\]/g,(item,index) => {})
// https://sad.apps.vip/public/static/emoji/emojistatic/
let folderPath = reactive([])
onMounted(() => {
    Object.values(fluentEmojis).forEach((item) => {
        folderPath.push(`https://sad.apps.vip/public/static/emoji/emojistatic/${item}`)
    })

})


const handleCancel = () => {
    previewVisible.value = false;
    previewTitle.value = '';
};
const handlePreview = async (file: UploadProps['fileList'][number]) => {
    if (!file.url && !file.preview) {
        file.preview = (await getBase64(file.originFileObj)) as string;
    }
    previewImage.value = file.url || file.preview;
    previewVisible.value = true;
    previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
const userInfo = computed(() => {
    return userStore.userInfo
})
let uid = userInfo.value.uid
let Info = {
    uid: uid,
    nickname: userInfo.nickname,
    avatar: userInfo.avatar
}
const showCard = (uid, Info) => {
    userStore.showUserCard(uid, Info)
}
onMounted(async () => {
    await userStore.getUserInfo()

})
</script>
<style lang='scss' scoped>
:deep(.ant-upload.ant-upload-select-picture-card) {
    width: 64px;
    height: 64px;
}

:deep(.ant-upload-list-picture-card-container) {
    width: 64px;
    height: 64px;
}

:deep(.ant-upload-list-picture-card .ant-upload-list-item-thumbnail) {
    font-size: 8px;
}

.btn {
    border: 1px solid var(--secondary-text);
}

.comment-input {
    border-radius: 8px;
    height: 40px;
    // width: 300px;
    width: calc(100% - 45px);
}

:deep(.ant-input) {
    color: var(--secondary-text);
    &::placeholder {
        font-weight: 400;
        font-size: 16px;
        font-family: PingFangSC-Regular;
    }
}

:deep(.tippy-box) {
    width: 51%;
    margin-left: 15%;
}
</style>