import Mux from "@mux/mux-node";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


const { video: Video } = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!
});


export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
){
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where:{
        id: params.courseId,
        userId,
      }
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chaptere = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId,
      }
    });

    if (!chaptere) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if(chaptere.videoUrl) {
      const exisitingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: params.chapterId,
        }
      });

      if(exisitingMuxData) {
        await Video.assets.delete(exisitingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: exisitingMuxData.id,
          }
        });
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: params.chapterId,
      }
    });

    const publishedChapterInCourse = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true,
      }
    });

    if(!publishedChapterInCourse.length) {
      await db.course.update({
        where: {
          id: params.courseId,
        },
        data: {
          isPublished: false,
        }
      });
    }

    return NextResponse.json(deletedChapter, { status: 200 });

  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]",error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const {isPublished, ...values} = await req.json();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });
    
    if (!ownCourse) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const chapter = await db.chapter.update({
        where: {
          id: params.chapterId,
          courseId: params.courseId,
        },
        data: {
          ...values,
        }
      });

      if(values.videoUrl) {
        const existingMuxData = await db.muxData.findFirst({
          where: {
            chapterId: params.chapterId,
          }
        });

        if(existingMuxData){
          await Video.assets.delete(existingMuxData.assetId);
          await db.muxData.delete({
            where: {
              id: existingMuxData.id,
            }
          });
        }

        const asset = await Video.assets.create({
          input: values.videoUrl,
          playback_policy: ["public"],
          test: false,
        });

        await db.muxData.create({
          data: {
            chapterId: params.chapterId,
            assetId: asset.id,
            playbackId: asset.playback_ids?.[0].id,
          }
        })
      }

      return NextResponse.json(chapter, { status: 200 });

} catch (error) {
    console.log("[COURSES_CHAPTER_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
