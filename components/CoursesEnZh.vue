<template>
  <div>
    <SocialHead
      :title="`Chinese Zero to Hero - Online Chinese Courses`"
      :description="`Online Chinese Courses from HSK 1 to HSK 9. Free courses include “Phonetics with Chinese Characteristics”, “Learn Chinese with Songs“, “Learn Chinese with Poems“.`"
      :image="`/img/courses/bundle-ultimate.jpg`"
    />

    <div class="container pt-5">
      <div class="row">
        <div class="col-sm-12 text-center">
          <!-- <Sale class="mb-5" /> -->
          <img src="/img/czh-logo-dark.png" alt="Chinese Zero to Hero" style="max-height: 5rem" class="mb-4">
          <p class="mb-5">Chinese Language Video Courses</p> 
          <VideoComp
            class="intro-video mb-5"
            thumbnail="/img/video-thumbnail-hsk-courses.jpeg"
            url="https://server.chinesezerotohero.com/data/video/website-intro-2022.mp4"
          />
        </div>
      </div>
    </div>
    <div class="container">
      <Courses />
      <FeedbackPrompt class="mt-5" :skin="$route.meta ? $route.meta.skin : 'light'"/>
      <h3 class="pb-5 pt-5 text-center">Follow Us</h3>
      <div class="row">
        <div class="col-md-6 col-lg-4 mb-5">
          <h5 class="mb-4 text-center">Instagram</h5>
          <a
            href="https://www.instagram.com/chinesezerotohero/"
            class="text-center"
          >
            <span class="media">
              <img src="/img/instagram.png" style="width: 4rem" />
              <div class="media-body">
                instagram.com/
                <b>chinesezerotohero</b>
              </div>
            </span>
          </a>
          <p>
            We regularly post "word of the day" images and grammar poster
            images. Get your daily dose of Chinese by following our Instagram
            account. We regularly upload grammar and vocabulary videos on IGTV
            as well.
          </p>
        </div>
        <div class="col-md-6 col-lg-4 mb-5">
          <h5 class="mb-4 text-center">Telegram</h5>
          <a href="https://t.me/zerotohero_zh" class="text-center">
            <span class="media">
              <img src="/img/telegram.png" style="width: 4rem" />
              <div class="media-body">t.me/zerotohero_zh</div>
            </span>
          </a>
          <TelegramPrompt bodyClasses="p-0 " headerType="small" />
        </div>
        <div class="col-md-6 col-lg-4 mb-5">
          <h5 class="mb-4 text-center">YouTube</h5>
          <a
            href="https://www.youtube.com/chinesezerotohero"
            class="text-center"
          >
            <span class="media">
              <img src="/img/youtube.png" style="width: 4rem" />
              <div class="media-body">
                youtube.com/
                <b>chinesezerotohero</b>
              </div>
            </span>
          </a>
          <p>
            We regularly post Chinese-learning videos to YouTube. We also
            provide frequent announcements regarding new course feature,
            promotional events, and such. In the comment area, you can also
            connect with other learners.
          </p>
          <p>
            Because we post a lot of content that is not found in our courses,
            we recommend that you follow us even if you've already bought all of
            our courses.
          </p>
        </div>
      </div>
    </div>
    <Testimonials />
    

    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          
          <h1 class="mb-5 text-center">
            Courses that take your Chinese to the next level.
          </h1>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6">
          <h3 class="mb-3">What makes our courses different?</h3>
          <h5>Functional</h5>
          <p>
            You learn a language so you can do things with it – to accomplish
            real-world tasks, or functions. From day 1, we focus on enabling
            students to “do something” with what they learn, and design our
            lessons around that objective. We try to steer around overuse of
            unnecessary jargons and lengthy explanations and focus on practical
            applications.
          </p>
          <h5>Engaging</h5>
          <p>
            <strong>
              Learning is hard work, but it should never be boring, so we
              designed our courses to be concise yet fun and engaging.
            </strong>
            &nbsp;We use instruction design principles proposed by
            <a href="https://en.wikipedia.org/wiki/Robert_M._Gagn%C3%A9">
              Robert M. Gagné
            </a>
            , as well as multimedia learning guidelines by
            <a href="https://en.wikipedia.org/wiki/Richard_E._Mayer">
              Richard E. Mayer
            </a>
            .&nbsp; The instructional designs are so successful that we have
            received many raving reviews from our students.
          </p>
          <h5>Communicative</h5>
          <p class>
            <strong>
              All of our
              <a href="https://courses.chinesezerotohero.com/courses/">
                courses
              </a>
              focus on communication and function
            </strong>
            . &nbsp;We strive to help students use the language by providing
            plenty of practice, both written and oral. &nbsp;We help and
            encourage students to practice with a language exchange partner via
            sites such as
            <a href="https://www.italki.com/affshare?ref=zerotohero ">iTalki</a>
            .&nbsp; This way students learn to use the language in real life,
            not just to pass tests.
          </p>
          <h5>Standardized</h5>
          <p class>
            <strong>
              All of our courses use the standardized HSK curriculum
            </strong>
            . &nbsp;When you complete a course, you will be able to pass the HSK
            test for that level so you can measure your progress and prove your
            ability.&nbsp; Carefully designed lessons following a well
            established program delivers real, measurable results. All courses
            follow the
            <strong>HSK Standard Course textbook by Jiang Liping.</strong>
          </p>
        </div>
        <div class="col-sm-6">
          <h3>Achieve fluent communication and outstanding HSK results.</h3>
          <p>
            A question commonly posed is, why do you have one of the
            best-selling HSK courses on the web? The answers lie in the
            instructional philosophy behind our courses. This page outlines some
            of the important differences between our courses and other learning
            products commonly found on the web.
          </p>
          <p>
            First of all, our courses aim to form a
            <strong>complete</strong>
            suit with
            <strong>progressive</strong>
            and
            <strong>interconnecting units</strong>
            . Rather than littering the collection with disjointed one-shot
            lessons, our material forms a complete whole – a series of
            step-by-step video-based instructional units that take a beginner
            beyond the highest level, progressing from HSK level 1 all the way
            through HSK level 6 and beyond. Such an integrated approach
            reassures the students that once they sign up with us they will be
            shown a clear path to success, thus saving them considerable amount
            of time and uncertainty.
          </p>
          <p>
            Granted, to be successful in acquiring Chinese as a second language,
            a learners need much more than a set of courses. They must be
            willing to make use of a variety of resources and expose themselves
            to large amounts of the target language through reading and
            listening.
            <span data-offset-key="e61re-0-0">
              Nevertheless, our courses can form the
            </span>
            <span data-offset-key="e61re-0-1">
              “
              <strong>backbone</strong>
              “
            </span>
            <span data-offset-key="e61re-0-2">
              of their learning, providing the structure students can base their
              learning on.
            </span>
            &nbsp;Learners will find unparalleled success if they take our
            courses in conjunction with the vast array of learning options out
            there.
          </p>
          <p>
            Second, our courses put the spotlight on what many students struggle
            with –
            <strong>grammar</strong>
            . Without proper knowledge of grammar, learners cannot accurately
            understand what they read or hear. In this regard, dictionaries are
            not particularly helpful because they do not explain sentence
            formation, at least not in a way that is clear to students at
            varying levels. Learning sentence formation is especially critical
            at the beginning stages where learners are utterly oblivious of even
            the most basic sentence patterns. As a result, many learners often
            resort to “guessing” by applying English grammar to Chinese
            sentences and misconstrue their meaning.&nbsp;
            <span>
              Therefore, to learn Chinese effectively, grammar instruction
              cannot be overlooked.
            </span>
          </p>
          <p>
            <span>
              Some resist the idea of explicitly learning grammar in favor of a
              more natural, input-based approach. We agree to this assertion to
              some extent because the nuances of Chinese grammar simply cannot
              be taught with explicit instruction alone. Nevertheless, input is
              only meaningful if they are understood. If learners are never
              taught grammar, how can they possibly understand sentences
              correctly? It is obvious, therefore, that some grammar must be
              made familiar to the students, especially at the beginning stages.
              Our grammar instruction strives to be&nbsp;
            </span>
            <strong class="s570a4-14 kYTLgH">
              simple and clear with ample examples&nbsp;
            </strong>
            <span>
              so that the learners can form sentences correctly without being
              unduly concerned with jargons and terms.
            </span>
          </p>
          <p>
            In short,
            <strong>
              curricular completeness and clear, step-by-step grammar
              instruction
            </strong>
            distinguishes us from most learning products out there. We hope
            these courses offer a meaningful contribution to the Chinese
            learning community.
          </p>
          
        </div>
        <div class="col-sm-12">
          <FeedbackPrompt class="mt-5" :skin="$route.meta ? $route.meta.skin : 'light'"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Testimonials from "@/components/Testimonials";
import TelegramPrompt from "@/components/TelegramPrompt";

export default {
  components: {
    Testimonials,
    TelegramPrompt,
  },
};
</script>

<style lang="scss" scoped>

.photo-jon,
.photo-ken {
  position: absolute;
  bottom: 0;
}
.photo-jon {
  height: 70%;
  right: 0;
}
.photo-ken {
  height: 90%;
  left: 0;
}

.intro-video {
  z-index: 2;
  position: inherit;
  max-width: 30rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  overflow: hidden;
  margin: 0 auto;
  &:hover {
    transform: scale(1.1);
    transition: 200ms ease-in-out;
  }
}

@media (max-width: 576px) {
  .intro-video {
    width: 100%;
  }
}
</style>
